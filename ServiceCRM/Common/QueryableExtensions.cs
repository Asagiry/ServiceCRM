using Microsoft.EntityFrameworkCore;

namespace ServiceCRM.Common
{
    public static class QueryableExtensions
    {
        public static async Task<PagedResult<T>> ToPagedListAsync<T>(
            this IQueryable<T> query,
            int page,
            int pageSize,
            CancellationToken ct = default)
        {
            page = Math.Max(1, page);
            pageSize = Math.Clamp(pageSize, 1, 100);

            int totalCount = await query.CountAsync(ct);

            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(ct);

            return new PagedResult<T>
            {
                Page = page,
                PageSize = pageSize,
                TotalCount = totalCount,
                Items = items
            };
        }
    }
}