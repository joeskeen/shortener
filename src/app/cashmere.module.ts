import { NgModule } from '@angular/core';
import {
  FormFieldModule,
  InputModule,
  ButtonModule,
  TileModule,
  ModalModule,
  ToasterModule,
  ProgressIndicatorsModule,
} from '@healthcatalyst/cashmere';

@NgModule({
  exports: [FormFieldModule, InputModule, ButtonModule, TileModule, ToasterModule, ProgressIndicatorsModule],
})
export class CashmereModule {}
