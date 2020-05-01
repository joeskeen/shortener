import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UrlService } from './url.service';
import { fromEvent } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  linkForm = new FormGroup({
    title: new FormControl(''),
    url: new FormControl('', [Validators.required]),
  });

  title: string;
  url: string;
  shortUrl: string;

  constructor(private urlService: UrlService) {}

  ngOnInit() {
    this.checkHash(window.location.hash);
    fromEvent(window, 'hashchange').subscribe(() => this.checkHash(window.location.hash));
  }

  async checkHash(hash: string) {
    const longUrl = await this.urlService.getLongUrl(hash);
    if (longUrl) {
      console.log('detected hash', hash, longUrl);
      window.location.href = longUrl;
    }
  }

  async submit() {
    if (this.linkForm.invalid) {
      return;
    }

    this.title = this.linkForm.value.title;
    this.url = this.linkForm.value.url;
    this.shortUrl = await this.urlService.getShortUrl(this.url);
  }
}
