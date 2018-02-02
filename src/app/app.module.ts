import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AgmCoreModule } from '@agm/core'
import { AppComponent } from './app.component';
import { LocationService } from './location.service';
import 'bootstrap';
import { AppRoutingModule } from './/app-routing.module';

@NgModule({
	declarations: [
		AppComponent
	],
	imports: [
		BrowserModule,
		AgmCoreModule.forRoot({
			apiKey: 'AIzaSyCusymbIjlWq1f0iUqIauXoYJ-PYfg530A'
		}),
		AppRoutingModule
	],
	providers: [LocationService],
	bootstrap: [AppComponent]
})
export class AppModule { }
