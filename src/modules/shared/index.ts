// Export shared services
export * from './services/otp/otp.service';
export * from './services/email/email.service';
export * from '../auth/services/jwt-auth.service';
export * from '../auth/services/public-token.service';
export * from './services/auth/device-session.service';

// Export shared strategies (if a module needs to reference them)
export * from '../auth/strategies/jwt.strategy';
export * from '../auth/strategies/public-token.strategy';

// Export shared enums
export * from './enums/otp-purpose.enum';
export * from './enums/otp-type.enum';
export * from './enums/device-type.enum';

// Export shared entities
export * from './entities/otp.entity';
export * from './entities/device-session.entity';

// Export shared module
export * from './shared.module';
