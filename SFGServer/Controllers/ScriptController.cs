using Microsoft.AspNetCore.Mvc;
using Microsoft.ClearScript.V8;

namespace SFGServer.Controllers;

[ApiController]
[Route("[controller]")]
public class ScriptController : ControllerBase
{
	[HttpGet]
	public string Greet(string name)
	{
		var engine = new V8ScriptEngine();
		engine.Global.SetProperty("username", name);

		engine.Execute(@"
function greet(name) {{
  if (name === 'Error') throw new Error('uh oh');
  return 'Hello, ' + name + '!';
}}
");

		var result = engine.Evaluate("greet(username)");

		if (result is string greeting)
		{
			return greeting;
		}

		throw new ArgumentException("Bad result!");
	}
}
