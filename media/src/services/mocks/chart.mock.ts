import { MOCK_CHART } from "./mockData";
import type { IChart, IChartGenre, IChartPeriod, IChartService } from "@/types/chart.types";

export const mockChartService: IChartService = {
  getChart: async (genre: IChartGenre, period: IChartPeriod): Promise<IChart> => {
    await new Promise((r) => setTimeout(r, 400));
    // Return the shared chart with genre/period swapped in
    return { ...MOCK_CHART, genre, period };
  },
};
