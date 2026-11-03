import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NarBarComponent } from '@Component/nar-bar/nar-bar.component';
@Component({ selector: 'app-login', imports: [NarBarComponent, RouterLink, RouterOutlet], templateUrl: './login.component.html', styleUrl: './login.component.css' })
export class LoginComponent {}
