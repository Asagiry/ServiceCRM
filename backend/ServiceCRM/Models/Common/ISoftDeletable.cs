namespace ServiceCRM.Models.Common
{
    /// <summary>
    /// Интерфейс для сущностей, поддерживающих мягкое (логическое) удаление.
    /// </summary>
    public interface ISoftDeletable
    {
        /// <summary>
        /// Флаг: удалена ли запись логически.
        /// </summary>
        bool IsDeleted { get; set; }
        /// <summary>
        /// Точная дата и время удаления (в UTC) для аудита.
        /// </summary>
        DateTime? DeletedAt { get; set; }
    }
}
