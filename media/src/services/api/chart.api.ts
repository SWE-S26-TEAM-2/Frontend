import { ENV } from "@/config/env";
import type { IChart, IChartGenre, IChartPeriod, IChartService } from "@/types/chart.types";

export const realChartService: IChartService = {
  getChart: async (genre: IChartGenre, period: IChartPeriod): Promise<IChart> => {
    const res = await fetch(`${ENV.API_BASE_URL}/charts?genre=${genre}&period=${period}`);
    if (!res.ok) throw new Error("Failed to fetch chart");
    return res.json();
  },
};
