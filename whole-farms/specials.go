package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"regexp"
	"strings"

	"github.com/PuerkitoBio/goquery"
	"github.com/joho/godotenv"
)

type Item struct {
	ItemName string  `json:"item_name"`
	Price    float64 `json:"price"`
}

type ScrapedData struct {
	Items []Item `json:"items"`
}

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	scrapeData()
}

func scrapeData() {
	// Read the existing specials file
	data, err := os.ReadFile("specials.json")
	if err != nil {
		log.Fatal("Error reading specials.json:", err)
	}

	var existingSpecials ScrapedData
	err = json.Unmarshal(data, &existingSpecials)
	if err != nil {
		log.Fatal("Error parsing JSON:", err)
	}

	// Make the HTTP request
	resp, err := http.Get("https://wholefarms.com.au/search?dd=1&q%5B%5D=special%3A1&q%5B%5D=category%3Abutcher")
	if err != nil {
		log.Fatal("Error making HTTP request:", err)
	}
	defer resp.Body.Close()

	// Read the response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Fatal("Error reading response body:", err)
	}

	// Parse the HTML
	doc, err := goquery.NewDocumentFromReader(strings.NewReader(string(body)))
	if err != nil {
		log.Fatal("Error parsing HTML:", err)
	}

	// Find the script tag containing gtmDataLayer
	var dataScript string
	doc.Find("script").Each(func(i int, s *goquery.Selection) {
		if strings.Contains(s.Text(), "window.gtmDataLayer") {
			dataScript = s.Text()
		}
	})

	if dataScript != "" {
		// Extract JSON data using regex
		re := regexp.MustCompile(`window\.gtmDataLayer = (\[.*?\]);`)
		matches := re.FindStringSubmatch(dataScript)
		if len(matches) > 1 {
			jsonData := matches[1]

			var parsedData []map[string]interface{}
			err = json.Unmarshal([]byte(jsonData), &parsedData)
			if err != nil {
				log.Fatal("Error parsing JSON data:", err)
			}

			if len(parsedData) > 1 {
				items, ok := parsedData[1]["ecommerce"].(map[string]interface{})["items"].([]interface{})
				if ok {
					newSpecials := ScrapedData{Items: make([]Item, len(items))}
					for i, item := range items {
						itemMap := item.(map[string]interface{})
						newSpecials.Items[i] = Item{
							ItemName: itemMap["item_name"].(string),
							Price:    itemMap["price"].(float64),
						}
					}

					// Compare existing and new specials
					removedItems, newItems := compareSpecials(existingSpecials.Items, newSpecials.Items)

					if len(newItems) > 0 || len(removedItems) > 0 {
						message := "Changes in specials:\n\n"

						if len(newItems) > 0 {
							message += "New Items:\n"
							for _, item := range newItems {
								message += fmt.Sprintf("Item: %s, Price: $%.2f\n", item.ItemName, item.Price)
							}
							message += "\n"
						}

						if len(removedItems) > 0 {
							message += "Removed Items:\n"
							for _, item := range removedItems {
								message += fmt.Sprintf("Item: %s, Price: $%.2f\n", item.ItemName, item.Price)
							}
						}

						message += fmt.Sprintln("\nSpecials page: https://wholefarms.com.au/search?dd=1&q%5B%5D=special%3A1&q%5B%5D=category%3Abutcher")

						err := sendTelegramMessage(message)
						if err != nil {
							log.Fatal("Error sending telegram message: ", err)
						}

						// Write the new data to a file
						newData, err := json.MarshalIndent(newSpecials, "", "  ")
						if err != nil {
							log.Fatal("Error marshaling JSON:", err)
						}

						err = os.WriteFile("specials.json", newData, 0644)
						if err != nil {
							log.Fatal("Error writing data to file:", err)
						}
					}
				}
			}
		}
	} else {
		fmt.Println("gtmDataLayer not found in script tags.")
	}
}

func compareSpecials(old, new []Item) (removedItems []Item, newItems []Item) {
	oldMap := make(map[string]Item)
	newMap := make(map[string]Item)

	for _, item := range old {
		oldMap[item.ItemName] = item
	}
	for _, item := range new {
		newMap[item.ItemName] = item
	}

	// Check for removed items
	for itemName, item := range oldMap {
		if _, found := newMap[itemName]; !found {
			removedItems = append(removedItems, item)
		}
	}

	// Check for new items
	for itemName, item := range newMap {
		if _, found := oldMap[itemName]; !found {
			newItems = append(newItems, item)
		}
	}

	return
}

func sendTelegramMessage(message string) error {
	botToken := os.Getenv("TELEGRAM_TOKEN")
	chatID := os.Getenv("CHAT_ID")
	telegramAPI := fmt.Sprintf("https://api.telegram.org/bot%s/sendMessage", botToken)
	data := url.Values{}
	data.Set("chat_id", chatID)
	data.Set("text", message)

	resp, err := http.PostForm(telegramAPI, data)
	if err != nil {
		return fmt.Errorf("failed to send message: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("telegram API responded with status code %d", resp.StatusCode)
	}

	return nil
}
