namespace ServiceCRM.Common
{
    public static class CacheKeys
    {
        public static string DashboardToday => "dashboard_today";

        public static string AnalyticsSummary(DateTime fromDate, DateTime toDate)
        {
            return $"analytics_summary_{fromDate:yyyyMMdd}_{toDate:yyyyMMdd}";
        }

        public static string AnalyticsSources(DateTime fromDate, DateTime toDate)
        {
            return $"analytics_sources_{fromDate:yyyyMMdd}_{toDate:yyyyMMdd}";
        }
    }
}
