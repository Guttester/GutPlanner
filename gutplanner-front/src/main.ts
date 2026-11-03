import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from '@App/app.config';
import { AppComponent } from '@App/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
