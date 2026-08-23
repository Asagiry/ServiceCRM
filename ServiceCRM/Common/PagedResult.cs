namespace ServiceCRM.Common
{
    public class PagedResult<T>
    {
        public List<T> Items { get; set; } = [];
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalCount { get; set; }
    }

    public static class PagedResultExtensions
    {
        public static PagedResult<TDto> Map<T, TDto>(
            this PagedResult<T> p,
            Func<T, TDto> f) => new() {
                Items = p.Items.Select(f).ToList(),
                Page = p.Page, 
                PageSize = p.PageSize, 
                TotalCount = p.TotalCount 
            };
    }
}