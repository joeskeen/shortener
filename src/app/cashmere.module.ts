import { NgModule } from '@angular/core';
import {
  FormFieldModule,
  InputModule,
  ButtonModule,
  TileModule,
} from '@healthcatalyst/cashmere';

@NgModule({
  exports: [FormFieldModule, InputModule, ButtonModule, TileModule],
})
export class CashmereModule {}
