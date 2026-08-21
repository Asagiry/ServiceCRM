using Microsoft.AspNetCore.Mvc;
using ServiceCRM.Class.Laed;
using ServiceCRM.Class.Lead;
using ServiceCRM.DTOs.LeadSourceDTOs;
using ServiceCRM.Services.LeadSourceService;
using System.ComponentModel;
using System.Runtime.InteropServices;

namespace ServiceCRM.Controllers
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
        [EndpointSummary("")]
        public async Task<ActionResult<List<LeadSource>>> GetLeadSources()
        {
            return Ok(await _leadSourceService.GetLeadSourcesAsync());
        }

        [HttpGet("{id}")]
        [EndpointSummary("")]
        public async Task<ActionResult<LeadSource>> GetLeadSourceById(
            [FromRoute][Description()]int id)
        {
            LeadSource? leadSource = await _leadSourceService.GetLeadSourceByIdAsync(id);

            if (leadSource != null)
            {
                return Ok(leadSource);
            }
            else
            {
                return NotFound();
            }
        }

        [HttpPost]
        [EndpointSummary("")]
        public async Task<ActionResult<LeadSource>> CreateLeadSource(
            [FromBody][Description]CreateLeadSourceDto dto)
        {
            LeadSource leadSource = await _leadSourceService.CreateLeadSourceAsync(dto);

            return CreatedAtAction(nameof(GetLeadSourceById), new { id = leadSource.Id }, leadSource);
        }

        [HttpPut("{id}")]
        [EndpointSummary("")]
        public async Task<ActionResult<LeadSource>> UpdateLeadSource(
            [FromRoute][Description]int id,
            [FromBody][Description]UpdateLeadSourceDto dto)
        {
            LeadSource? leadsource = await _leadSourceService.UpdateLeadSourceAsync(id, dto);

            if (leadsource != null)
            {
                return Ok(leadsource);
            }
            else
            {
                return NotFound();
            }
        }

        [HttpDelete("{id}")]
        [EndpointSummary("")]
        public async Task<ActionResult<LeadSource>> DeleteLeadSource(
            [FromRoute][Description]int id)
        {
            LeadSource? leadSource = await _leadSourceService.DeleteLeadSourceAsync(id);

            if (leadSource != null)
            {
                return Ok(leadSource);
            }
            else
            {
                return NotFound();
            }
        }

        [HttpPost("{id}/expenses")]
        [EndpointSummary("")]
        public async Task<ActionResult<AdExpense>> CreateAdExpense(
            [FromRoute][Description]int id,
            [FromBody][Description]CreateAdExpenseDto dto)
        {
            AdExpense? adExpense = await _leadSourceService.CreateAdExpenseAsync(id, dto);

            if (adExpense != null)
            {
                return Ok(adExpense);
            }
            else
            {
                return NotFound();
            }
        }

        [HttpDelete("expenses/{id}")]
        [EndpointSummary("")]
        public async Task<ActionResult<AdExpense>> DeleteAdExpense(
            [FromRoute][Description]int id)
        {
            AdExpense? adExpense = await _leadSourceService.DeleteAdExpenseAsync(id);

            if (adExpense != null)
            {
                return Ok(adExpense);
            }
            else
            {
                return NotFound();
            }
        }

    }
}
