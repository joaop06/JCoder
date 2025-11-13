import {
  ApplicationsStatsDto,
  TechnologiesStatsDto,
  UnreadMessagesDto,
  ProfileCompletenessDto,
  DashboardResponseDto,
} from '@/types/api/dashboard';
import { ApiService } from '../api.service';

export const DashboardService = {
  /**
   * Get applications statistics
   * GET /:username/dashboard/applications/stats
   */
  async getApplicationsStats(username: string): Promise<ApplicationsStatsDto> {
    try {
      const response = await ApiService.get(`/${username}/dashboard/applications/stats`);
      return response.data.data || response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get technologies statistics
   * GET /:username/dashboard/technologies/stats
   */
  async getTechnologiesStats(username: string): Promise<TechnologiesStatsDto> {
    try {
      const response = await ApiService.get(`/${username}/dashboard/technologies/stats`);
      return response.data.data || response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get unread messages statistics
   * GET /:username/dashboard/messages/unread
   */
  async getUnreadMessagesStats(username: string): Promise<UnreadMessagesDto> {
    try {
      const response = await ApiService.get(`/${username}/dashboard/messages/unread`);
      return response.data.data || response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get profile completeness
   * GET /:username/dashboard/profile/completeness
   */
  async getProfileCompleteness(username: string): Promise<ProfileCompletenessDto> {
    try {
      const response = await ApiService.get(`/${username}/dashboard/profile/completeness`);
      return response.data.data || response.data;
    } catch (error) {
      throw error;
    }
  },
};

