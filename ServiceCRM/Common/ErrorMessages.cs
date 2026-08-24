using ServiceCRM.Models.Request;
using System.Net.NetworkInformation;

namespace ServiceCRM.Common
{
    public static class ErrorMessages
    {
        public static string ClientNotFound(int id) => $"Клиент с Id = {id} не найден.";
        public static string MasterNotFound(int id) => $"Мастер с Id = {id} не найден.";
        public static string ServiceRequestNotFound(int id) => $"Заявка с Id = {id} не найдена.";
        public static string LeadSourceNotFound(int id) => $"Источник лидов с Id = {id} не найден.";
        public static string AdExpenseNotFound(int id) => $"Расход на рекламу с Id = {id} не найден.";
        public static string PaymentNotFound(int requestId) => $"Платеж по заявке #{requestId} не найден.";
        public static string AuthorizationFailed() => "Неверный логин или пароль";
        public static string ServiceRequestConflict(RequestStatus currentStatus, RequestStatus newStatus) 
            =>  $"Переход статуса из {currentStatus} в {newStatus} невозможен";
    }
}
