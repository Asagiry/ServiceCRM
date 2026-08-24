using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ServiceCRM.Common;
using ServiceCRM.DTOs.LeadSourceDTOs;
using ServiceCRM.Models.Lead;
using ServiceCRM.Services.LeadSourceService;
using System.ComponentModel;

namespace ServiceCRM.Controllers.Base
{
    [ApiController]
    [Authorize(Roles = Roles.Admin)]
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
        public async Task<ActionResult<PagedResult<LeadSourceResponseDto>>> GetLeadSources(
            int page = 1, 
            int pageSize = 20,
            CancellationToken ct = default)
        {
            return Ok(await _leadSourceService.GetLeadSourcesAsync(page,pageSize, ct));
        }

        [HttpGet("{id}")]
        [EndpointSummary("Получить источник с рекламными компаниями")]
        public async Task<ActionResult<LeadSourceResponseDto>> GetLeadSourceById(
            [FromRoute][Description("Id искомого источника")]int id,
            CancellationToken ct)
        {
             return Ok(await _leadSourceService.GetLeadSourceByIdAsync(id, ct));
        }

        [HttpPost]
        [EndpointSummary("Создать новый источник по Dto")]
        public async Task<ActionResult<LeadSourceResponseDto>> CreateLeadSource(
            [FromBody][Description("Dto создаваемого источника")]CreateLeadSourceDto dto,
            CancellationToken ct)
        {
            LeadSourceResponseDto leadSource = await _leadSourceService.CreateLeadSourceAsync(dto, ct);

            return CreatedAtAction(nameof(GetLeadSourceById), new { id = leadSource.Id }, leadSource);
        }

        [HttpPut("{id}")]
        [EndpointSummary("Обновить источник по Id и Dto")]
        public async Task<ActionResult<LeadSourceResponseDto>> UpdateLeadSource(
            [FromRoute][Description("Id обновляемого источника")]int id,
            [FromBody][Description("Dto обновляемого источника")]UpdateLeadSourceDto dto,
            CancellationToken ct)
        {
            return Ok(await _leadSourceService.UpdateLeadSourceAsync(id, dto, ct));
        }

        [HttpDelete("{id}")]
        [EndpointSummary("Удалить источник по id")]
        public async Task<ActionResult<LeadSourceResponseDto>> DeleteLeadSource(
            [FromRoute][Description("Id удаляемого источника")]int id,
            CancellationToken ct)
        {
            await _leadSourceService.DeleteLeadSourceAsync(id, ct);
            return NoContent();
        }

        [HttpPost("{id}/expenses")]
        [EndpointSummary("Создать рекламную компанию для источника")]
        public async Task<ActionResult<LeadSourceResponseDto>> CreateAdExpense(
            [FromRoute][Description("Id источника")]int id,
            [FromBody][Description("Dto новой рекламной компании")]CreateAdExpenseDto dto,
            CancellationToken ct)
        {
            return Ok(await _leadSourceService.CreateAdExpenseAsync(id, dto, ct));
        }

        [HttpDelete("expenses/{id}")]
        [EndpointSummary("Удалить рекламную компанию источника")]
        public async Task<ActionResult> DeleteAdExpense(
            [FromRoute][Description("Id рекламной компании")]int id,
            CancellationToken ct)
        {
            await _leadSourceService.DeleteAdExpenseAsync(id, ct);
            return NoContent();
        }

    }
}
