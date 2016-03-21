import {Inject} from "angular2/core";
import {Http} from "angular2/http";

export class StatsService {

  http:Http;

  constructor(@Inject(Http) http) {
    this.http = http;
  }

  getStats() {
    return new Promise((resolve, reject) => {
        this.http.get('http://localhost:9000/internal/stats/test').subscribe(res => {
          resolve(res.json());
        }, error => {
          reject(error);
        });
      }
    );
  }

}
