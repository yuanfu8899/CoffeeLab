import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';

import { GoogleSheetsService } from './google-sheets';

describe('GoogleSheetsService', () => {
  let service: GoogleSheetsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient()
      ]
    });
    service = TestBed.inject(GoogleSheetsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
