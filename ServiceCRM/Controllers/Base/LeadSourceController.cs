using Microsoft.AspNetCore.Mvc;
using ServiceCRM.Models.Lead;
using ServiceCRM.DTOs.LeadSourceDTOs;
using ServiceCRM.Services.LeadSourceService;
using System.ComponentModel;

namespace ServiceCRM.Controllers.Base
{
    [ApiController]
    [Route("api/lead-sources")]
    public class LeadSourceController: ControllerBase
    {
        ILeadSourceService _leadSourceService;

        public LeadSourceController(ILeadSourceService leadSourceService)
        {
            _leadSourceService = leadSourceService;
        }

        [HttpGet]
        [EndpointSummary("Получить список источников с рекламными компаниями")]
        public async Task<ActionResult<List<LeadSource>>> GetLeadSources(
            CancellationToken ct)
        {
            return Ok(await _leadSourceService.GetLeadSourcesAsync(ct));
        }

        [HttpGet("{id}")]
        [EndpointSummary("Получить источник с рекламными компаниями")]
        public async Task<ActionResult<LeadSource>> GetLeadSourceById(
            [FromRoute][Description("Id искомого источника")]int id,
            CancellationToken ct)
        {
             return Ok(await _leadSourceService.GetLeadSourceByIdAsync(id, ct));
        }

        [HttpPost]
        [EndpointSummary("Создать новый источник по Dto")]
        public async Task<ActionResult<LeadSource>> CreateLeadSource(
            [FromBody][Description("Dto создаваемого источника")]CreateLeadSourceDto dto,
            CancellationToken ct)
        {
            LeadSource leadSource = await _leadSourceService.CreateLeadSourceAsync(dto, ct);

            return CreatedAtAction(nameof(GetLeadSourceById), new { id = leadSource.Id }, leadSource);
        }

        [HttpPut("{id}")]
        [EndpointSummary("Обновить источник по Id и Dto")]
        public async Task<ActionResult<LeadSource>> UpdateLeadSource(
            [FromRoute][Description("Id обновляемого источника")]int id,
            [FromBody][Description("Dto обновляемого источника")]UpdateLeadSourceDto dto,
            CancellationToken ct)
        {
            return Ok(await _leadSourceService.UpdateLeadSourceAsync(id, dto, ct));
        }

        [HttpDelete("{id}")]
        [EndpointSummary("Удалить источник по id")]
        public async Task<ActionResult<LeadSource>> DeleteLeadSource(
            [FromRoute][Description("Id удаляемого источника")]int id,
            CancellationToken ct)
        {
            return Ok(await _leadSourceService.DeleteLeadSourceAsync(id, ct));
        }

        [HttpPost("{id}/expenses")]
        [EndpointSummary("Создать рекламную компанию для источника")]
        public async Task<ActionResult<AdExpense>> CreateAdExpense(
            [FromRoute][Description("Id источника")]int id,
            [FromBody][Description("Dto новой рекламной компании")]CreateAdExpenseDto dto,
            CancellationToken ct)
        {
            return Ok(await _leadSourceService.CreateAdExpenseAsync(id, dto, ct));
        }

        [HttpDelete("expenses/{id}")]
        [EndpointSummary("Удалить рекламную компанию источника")]
        public async Task<ActionResult<AdExpense>> DeleteAdExpense(
            [FromRoute][Description("Id рекламной компании")]int id,
            CancellationToken ct)
        {
            return Ok(await _leadSourceService.DeleteAdExpenseAsync(id, ct));
        }

    }
}
