import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';

import { BeansComponent } from './beans';

describe('BeansComponent', () => {
  let component: BeansComponent;
  let fixture: ComponentFixture<BeansComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BeansComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BeansComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
