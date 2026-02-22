package service

import (
	"fmt"
	"os/exec"
	"sync"
)

type SingBoxService struct {
	cmd     *exec.Cmd
	mu      sync.Mutex
	running bool
}

func NewSingBoxService() *SingBoxService {
	return &SingBoxService{}
}

func (s *SingBoxService) Start() error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if s.running {
		return fmt.Errorf("sing-box is already running")
	}

	// This assumes sing-box binary is in PATH or specific location
	// In production, we might want to download/update it dynamically
	s.cmd = exec.Command("sing-box", "run", "-c", "config.json")
	
	if err := s.cmd.Start(); err != nil {
		return err
	}

	s.running = true
	go s.monitor()

	return nil
}

func (s *SingBoxService) Stop() error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if !s.running || s.cmd == nil {
		return nil
	}

	if err := s.cmd.Process.Kill(); err != nil {
		return err
	}

	s.running = false
	return nil
}

func (s *SingBoxService) monitor() {
	if s.cmd == nil {
		return
	}
	s.cmd.Wait()
	s.mu.Lock()
	s.running = false
	s.mu.Unlock()
}
