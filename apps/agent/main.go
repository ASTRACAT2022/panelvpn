package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/panelvpn/agent/api"
	"github.com/panelvpn/agent/config"
	"github.com/panelvpn/agent/service"
)

func main() {
	log.Println("Starting Node Agent...")

	// 1. Load Configuration
	cfg, err := config.LoadConfig("agent-config.json")
	if err != nil {
		log.Printf("Warning: Could not load config: %v. Using defaults or environment variables.", err)
		// In a real scenario, we might fail here or load from env vars
		cfg = &config.Config{
			PanelURL: "http://localhost:3000",
			NodeID:   "dev-node-1",
			Token:    "dev-token",
		}
	}

	// 2. Initialize Components
	apiClient, err := api.NewClient(cfg)
	if err != nil {
		log.Fatalf("Failed to initialize API client: %v", err)
	}
	singBoxService := service.NewSingBoxService()

	// 3. Start Sing-box Service
	log.Println("Starting Sing-box service...")
	if err := singBoxService.Start(); err != nil {
		log.Printf("Failed to start Sing-box: %v", err)
		// Depending on requirements, we might want to exit or continue (e.g., if we just need to report status)
	}

	// 4. Start Heartbeat Loop
	go func() {
		ticker := time.NewTicker(30 * time.Second)
		defer ticker.Stop()

		for {
			select {
			case <-ticker.C:
				if err := apiClient.SendHeartbeat(); err != nil {
					log.Printf("Heartbeat failed: %v", err)
				} else {
					log.Println("Heartbeat sent successfully")
				}
			}
		}
	}()

	// 5. Wait for Shutdown Signal
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	<-sigChan
	log.Println("Shutting down Node Agent...")

	// 6. Cleanup
	if err := singBoxService.Stop(); err != nil {
		log.Printf("Error stopping Sing-box: %v", err)
	}
}
