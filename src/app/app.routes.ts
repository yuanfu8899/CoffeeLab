import { Routes } from '@angular/router';
import { ConverterComponent } from './components/converter/converter';
import { TimerComponent } from './components/timer/timer';
import { HistoryComponent } from './components/history/history';
import { SettingsComponent } from './components/settings/settings';
import { BeansComponent } from './components/beans/beans';
import { MethodsComponent } from './components/methods/methods';

export const routes: Routes = [
  { path: '', redirectTo: 'converter', pathMatch: 'full' },
  { path: 'converter', component: ConverterComponent },
  { path: 'timer', component: TimerComponent },
  { path: 'beans', component: BeansComponent },
  { path: 'methods', component: MethodsComponent },
  { path: 'history', component: HistoryComponent },
  { path: 'settings', component: SettingsComponent },
  { path: '**', redirectTo: 'converter' }
];
