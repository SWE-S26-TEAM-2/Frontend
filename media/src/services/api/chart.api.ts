import { ENV } from "@/config/env";
import type { IChart, IChartGenre, IChartPeriod, IChartService } from "@/types/chart.types";
import { apiGet } from "./apiClient";

export const realChartService: IChartService = {
  getChart: async (genre: IChartGenre, period: IChartPeriod): Promise<IChart> => {
    try {
      return await apiGet<IChart>(`${ENV.API_BASE_URL}/charts?genre=${genre}&period=${period}`);
    } catch {
      // Backend has no charts endpoint — throw so the page can show an error state
      throw new Error("Charts not available — backend not implemented");
    }
  },
};
