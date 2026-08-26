namespace ServiceCRM.Models.Request
{
    public enum RequestStatus
    {
        /// <summary>
        /// Новая заявка
        /// </summary>
        New = 0,
        /// <summary>
        /// Заявке присвоен мастер
        /// </summary>
        Assigned = 1,
        /// <summary>
        /// Заявка в процессе выполнения
        /// </summary>
        InProgress = 2,
        /// <summary>
        /// Мастер завершил заявку
        /// </summary>
        Completed = 3,
        /// <summary>
        /// Заявка отменена
        /// </summary>
        Cancelled = 4
    }
}
