import { Module } from '@nestjs/common';
import { WifiService } from './wifi.service';
import { WifiController } from './wifi.controller';

@Module({
  controllers: [WifiController],
  providers: [WifiService],
})
export class WifiModule {}
