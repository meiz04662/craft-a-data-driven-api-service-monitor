import * as express from 'express';
import * as axios from 'axios';

interface APIResponse {
  status: number;
  data: any;
}

interface APIService {
  name: string;
  url: string;
  timeout: number;
}

class DataDrivenAPIMonitor {
  private services: APIService[];
  private app: express.Express;

  constructor(services: APIService[]) {
    this.services = services;
    this.app = express();
    this.app.use(express.json());
  }

  public start() {
    this.services.forEach((service) => {
      this.app.get(`/${service.name}`, async (req, res) => {
        try {
          const response = await axios.get(service.url, { timeout: service.timeout });
          const apiResponse: APIResponse = {
            status: response.status,
            data: response.data,
          };
          res.json(apiResponse);
        } catch (error) {
          console.error(`Error calling ${service.name} API:`, error);
          res.status(500).json({ error: 'API call failed' });
        }
      });
    });
    this.app.listen(3000, () => {
      console.log('Data-driven API service monitor started on port 3000');
    });
  }
}

const services: APIService[] = [
  { name: 'github', url: 'https://api.github.com/users/5u5x', timeout: 5000 },
  { name: 'twitter', url: 'https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name=5u5x', timeout: 3000 },
  // Add more services here
];

const monitor = new DataDrivenAPIMonitor(services);
monitor.start();