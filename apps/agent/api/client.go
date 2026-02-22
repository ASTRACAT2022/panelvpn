package api

import (
	"bytes"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/panelvpn/agent/config"
)

type Client struct {
	cfg        *config.Config
	httpClient *http.Client
}

func NewClient(cfg *config.Config) (*Client, error) {
	tlsConfig := &tls.Config{}

	// Load client certificate if provided
	if cfg.CertFile != "" && cfg.KeyFile != "" {
		cert, err := tls.LoadX509KeyPair(cfg.CertFile, cfg.KeyFile)
		if err != nil {
			return nil, fmt.Errorf("failed to load client certificate: %v", err)
		}
		tlsConfig.Certificates = []tls.Certificate{cert}
	}

	// In a real mTLS scenario, we might also need to load the CA cert to verify the server
	// For now, we'll skip InsecureSkipVerify unless explicitly needed, but typically mTLS implies strict verification
	// tlsConfig.InsecureSkipVerify = true // Uncomment for dev if self-signed without CA pool

	transport := &http.Transport{
		TLSClientConfig: tlsConfig,
	}

	return &Client{
		cfg: cfg,
		httpClient: &http.Client{
			Transport: transport,
			Timeout:   10 * time.Second,
		},
	}, nil
}

func (c *Client) SendHeartbeat() error {
	payload := map[string]interface{}{
		"node_id":   c.cfg.NodeID,
		"status":    "ONLINE",
		"timestamp": time.Now().Unix(),
		"version":   "0.0.1", // TODO: Get actual version
	}

	data, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	// Use HTTPS by default for mTLS
	url := fmt.Sprintf("%s/api/nodes/heartbeat", c.cfg.PanelURL)
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(data))
	if err != nil {
		return err
	}

	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.cfg.Token))
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		// Read body for error message
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("heartbeat failed with status: %d, body: %s", resp.StatusCode, string(body))
	}

	return nil
}
