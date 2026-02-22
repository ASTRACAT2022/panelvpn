const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

export const api = {
  auth: {
    login: async (email: string, password: string) => {
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      return response.json();
    },
    
    register: async (email: string, password: string, name: string) => {
      const response = await fetch(`${apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });
      return response.json();
    },
    
    getProfile: async (token: string) => {
      const response = await fetch(`${apiUrl}/api/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.json();
    },
  },
  
  nodes: {
    getAll: async (token: string) => {
      const response = await fetch(`${apiUrl}/api/nodes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.json();
    },
    
    create: async (token: string, data: any) => {
      const response = await fetch(`${apiUrl}/api/nodes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    
    update: async (token: string, id: string, data: any) => {
      const response = await fetch(`${apiUrl}/api/nodes/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    
    delete: async (token: string, id: string) => {
      const response = await fetch(`${apiUrl}/api/nodes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.ok;
    },
  },
  
  clusters: {
    getAll: async (token: string) => {
      const response = await fetch(`${apiUrl}/api/clusters`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.json();
    },
    
    create: async (token: string, data: any) => {
      const response = await fetch(`${apiUrl}/api/clusters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      return response.json();
    },
  },
  
  monitoring: {
    getStats: async (token: string) => {
      const response = await fetch(`${apiUrl}/api/monitoring/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.json();
    },
    
    getTraffic: async (token: string) => {
      const response = await fetch(`${apiUrl}/api/monitoring/traffic`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.json();
    },
    
    getNodeHealth: async (token: string) => {
      const response = await fetch(`${apiUrl}/api/monitoring/nodes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.json();
    },
  },
};
