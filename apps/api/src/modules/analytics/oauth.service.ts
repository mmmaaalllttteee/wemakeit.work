import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  authUrl: string;
  tokenUrl: string;
  scopes: string[];
}

interface OAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  scope?: string[];
}

@Injectable()
export class OAuthService {
  private providers: Record<string, OAuthConfig>;

  constructor(private configService: ConfigService) {
    this.providers = {
      google_analytics: {
        clientId: this.configService.get('GOOGLE_CLIENT_ID'),
        clientSecret: this.configService.get('GOOGLE_CLIENT_SECRET'),
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        scopes: [
          'https://www.googleapis.com/auth/analytics.readonly',
          'https://www.googleapis.com/auth/youtube.readonly',
        ],
      },
      meta_business: {
        clientId: this.configService.get('META_CLIENT_ID'),
        clientSecret: this.configService.get('META_CLIENT_SECRET'),
        authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
        tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
        scopes: [
          'business_management',
          'pages_read_engagement',
          'pages_show_list',
          'instagram_basic',
          'instagram_manage_insights',
        ],
      },
      youtube: {
        clientId: this.configService.get('GOOGLE_CLIENT_ID'),
        clientSecret: this.configService.get('GOOGLE_CLIENT_SECRET'),
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        scopes: [
          'https://www.googleapis.com/auth/youtube.readonly',
          'https://www.googleapis.com/auth/yt-analytics.readonly',
        ],
      },
      spotify: {
        clientId: this.configService.get('SPOTIFY_CLIENT_ID'),
        clientSecret: this.configService.get('SPOTIFY_CLIENT_SECRET'),
        authUrl: 'https://accounts.spotify.com/authorize',
        tokenUrl: 'https://accounts.spotify.com/api/token',
        scopes: ['user-read-email', 'user-top-read', 'user-read-recently-played'],
      },
      apple_music: {
        clientId: this.configService.get('APPLE_CLIENT_ID'),
        clientSecret: this.configService.get('APPLE_CLIENT_SECRET'),
        authUrl: 'https://appleid.apple.com/auth/authorize',
        tokenUrl: 'https://appleid.apple.com/auth/token',
        scopes: ['name', 'email'],
      },
      tiktok: {
        clientId: this.configService.get('TIKTOK_CLIENT_ID'),
        clientSecret: this.configService.get('TIKTOK_CLIENT_SECRET'),
        authUrl: 'https://www.tiktok.com/auth/authorize',
        tokenUrl: 'https://open-api.tiktok.com/oauth/access_token',
        scopes: ['user.info.basic', 'video.list'],
      },
      instagram: {
        clientId: this.configService.get('META_CLIENT_ID'),
        clientSecret: this.configService.get('META_CLIENT_SECRET'),
        authUrl: 'https://api.instagram.com/oauth/authorize',
        tokenUrl: 'https://api.instagram.com/oauth/access_token',
        scopes: ['user_profile', 'user_media'],
      },
    };
  }

  /**
   * Generate OAuth authorization URL
   */
  getAuthorizationUrl(provider: string, redirectUri: string, state?: string): string {
    const config = this.providers[provider];
    if (!config) {
      throw new BadRequestException(`Unsupported provider: ${provider}`);
    }

    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: config.scopes.join(' '),
      access_type: 'offline', // For Google to get refresh token
      prompt: 'consent', // Force consent screen to get refresh token
      ...(state && { state }),
    });

    return `${config.authUrl}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForTokens(
    provider: string,
    code: string,
    redirectUri: string,
  ): Promise<OAuthTokens> {
    const config = this.providers[provider];
    if (!config) {
      throw new BadRequestException(`Unsupported provider: ${provider}`);
    }

    try {
      const params = new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      });

      const response = await axios.post(config.tokenUrl, params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const {data} = response;

      // Calculate expiration date
      let expiresAt: Date | undefined;
      if (data.expires_in) {
        expiresAt = new Date(Date.now() + data.expires_in * 1000);
      }

      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt,
        scope: data.scope ? data.scope.split(' ') : config.scopes,
      };
    } catch (error) {
      console.error(`OAuth token exchange failed for ${provider}:`, error);
      throw new BadRequestException(
        `Failed to exchange code for tokens: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(provider: string, refreshToken: string): Promise<OAuthTokens> {
    const config = this.providers[provider];
    if (!config) {
      throw new BadRequestException(`Unsupported provider: ${provider}`);
    }

    try {
      const params = new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      });

      const response = await axios.post(config.tokenUrl, params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const {data} = response;

      let expiresAt: Date | undefined;
      if (data.expires_in) {
        expiresAt = new Date(Date.now() + data.expires_in * 1000);
      }

      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token || refreshToken, // Some providers don't return new refresh token
        expiresAt,
        scope: data.scope ? data.scope.split(' ') : undefined,
      };
    } catch (error) {
      console.error(`OAuth token refresh failed for ${provider}:`, error);
      throw new BadRequestException(
        `Failed to refresh token: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Revoke access token
   */
  async revokeToken(provider: string, token: string): Promise<void> {
    const revokeUrls: Record<string, string> = {
      google_analytics: 'https://oauth2.googleapis.com/revoke',
      youtube: 'https://oauth2.googleapis.com/revoke',
      spotify: 'https://accounts.spotify.com/api/token',
      // Add other providers as needed
    };

    const revokeUrl = revokeUrls[provider];
    if (!revokeUrl) {
      console.warn(`No revoke URL configured for provider: ${provider}`);
      return;
    }

    try {
      await axios.post(revokeUrl, new URLSearchParams({ token }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
    } catch (error) {
      console.error(`Failed to revoke token for ${provider}:`, error);
      // Don't throw - revocation is best-effort
    }
  }

  /**
   * Validate if provider is supported
   */
  isProviderSupported(provider: string): boolean {
    return provider in this.providers;
  }

  /**
   * Get provider configuration
   */
  getProviderConfig(provider: string): OAuthConfig | undefined {
    return this.providers[provider];
  }
}
