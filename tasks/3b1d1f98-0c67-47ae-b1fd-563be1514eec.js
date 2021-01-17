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

*Bu sefer ki görev de amacınız kullanıcıdan input olarak bir isim almak. Daha sonra aldığınız bu ismi ekrana "İsminiz: " formatında yazdırmalısınız. .*

**Örnek**

*Eğer kullanıcı inputa "Serhat" yazarsa ekrana "İsminiz: Serhat" yazmalısınız.*
`
module.exports = {
  "languages": {
    "python": ""
  },
  "content": content,
  "testCases": [{input: "Kerem", output: "İsminiz: Kerem\n"}, {input: "Kenan", output: "İsminiz: Kenan\n"}, {input: "Merve", output: "İsminiz: Merve\n"}]

}
