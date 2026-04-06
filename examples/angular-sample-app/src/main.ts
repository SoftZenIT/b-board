import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Import b-board to register the custom element
import 'b-board';

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
