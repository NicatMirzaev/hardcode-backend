const javaCode = `import java.util.*;
import java.lang.*;

class Rextester
{
    public static void main(String args[])
    {
    }
}`

const c_cpp = `#include <iostream>

int main()
{
}
`
const csharpCode = `using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;

namespace Rextester
{
    public class Program
    {
        public static void Main(string[] args)
        {
        }
    }
}
`
const content = `**Görev**

*Bu sefer ki görev de amacınız kullanıcıdan bir değer (input) almak. Daha sonra aldığınız bu değeri ekrana yazdırmalısınız. Unutmayın, değer string, integer veya float bir değer olabilir.*
**Örnek**
*Eğer kullanıcı değer olarak "selam" yazarsa ekrana "selam" yazmalısınız.*
`
module.exports = {
  "languages": {
    "python": "",
    "javascript": "",
    "java": javaCode,
    "c_cpp": c_cpp,
    "csharp": csharpCode

  },
  "content": content,
  "testCases": [{input: "Merhaba, nasılsın?", output: "Merhaba, nasılsın?\n"}, {input: "selam!", output: "selam!\n"}, {input: "5", output: "5\n"}]

}
