import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UrlService } from './url.service';
import { fromEvent } from 'rxjs';
import { HcToasterService } from '@healthcatalyst/cashmere';

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

  constructor(private urlService: UrlService, private toasterService: HcToasterService) {}

  ngOnInit() {
    this.checkHash(window.location.hash);
    fromEvent(window, 'hashchange').subscribe(() =>
      this.checkHash(window.location.hash)
    );
  }

  async checkHash(hash: string) {
    if (!hash || hash.length === 1) {
      return;
    }
    hash = hash.replace(/^#/, '');

    this.toasterService.addToast({ type: 'info', header: 'Redirecting', body: `Resolving URL for hash '${hash}'...`});
    const longUrl = await this.urlService.getLongUrl(hash);
    if (longUrl) {
      window.location.href = longUrl;
      this.toasterService.addToast({ type: 'info', header: 'Redirecting', body: `Redirecting to '${longUrl}'...`});
    } else {
      this.toasterService.addToast({ type: 'alert', header: 'Oops!', body: `We couldn't find a URL matching hash '${hash}'.` });
    }
  }

  async submit() {
    if (this.linkForm.invalid) {
      return;
    }

    this.title = this.linkForm.value.title;
    this.url = this.linkForm.value.url;
    this.shortUrl = null; // to force progress indicator

    this.shortUrl = await this.urlService.getShortUrl(this.url);
  }
}
