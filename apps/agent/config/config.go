package config

import (
	"encoding/json"
	"os"
)

type Config struct {
	PanelURL string `json:"panel_url"`
	NodeID   string `json:"node_id"`
	Token    string `json:"token"`
	CertFile string `json:"cert_file"`
	KeyFile  string `json:"key_file"`
}

func LoadConfig(path string) (*Config, error) {
	file, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	decoder := json.NewDecoder(file)
	config := &Config{}
	err = decoder.Decode(config)
	if err != nil {
		return nil, err
	}

	return config, nil
}
