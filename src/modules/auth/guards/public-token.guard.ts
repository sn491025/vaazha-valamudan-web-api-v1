import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class PublicTokenGuard extends AuthGuard('public-token') {}
