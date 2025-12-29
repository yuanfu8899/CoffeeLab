import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BrewLogicService {

  constructor() { }

  calculate(beanWeight: number, roast: 'light' | 'medium' | 'dark') {
    let ratio = 15;
    let temp = 90;

    switch (roast) {
      case 'light':
        ratio = 16;
        temp = 92;
        break;
      case 'medium':
        ratio = 15;
        temp = 90;
        break;
      case 'dark':
        ratio = 13;
        temp = 85;
        break;
    }

    return {
      waterWeight: beanWeight * ratio,
      temperature: temp,
      ratio: `1:${ratio}`
    };
  }
}
