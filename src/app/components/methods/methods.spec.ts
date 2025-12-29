import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';

import { MethodsComponent } from './methods';

describe('MethodsComponent', () => {
  let component: MethodsComponent;
  let fixture: ComponentFixture<MethodsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MethodsComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MethodsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
