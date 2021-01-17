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

*Bu sefer ki görev de amacınız kullanıcıdan input olarak bir tam sayı almak. Daha sonra aldığınız sayının tek veya çift olduğunu ekrana yazdırmalısınız. Eğer tek ise ekrana "Girdiğiniz sayı tek bir sayıdır." yazmalısınız.\
Eğer çift ise ekrana "Girdiğiniz sayı çift bir sayıdır." yazmalısınız.*

**Örnek**

*Eğer kullanıcı tam sayı olarak 5 yazarsa, ekrana "Girdiğiniz sayı tek bir sayıdır." yazmalısınız.*
`
module.exports = {
  "languages": {
    "python": ""
  },
  "content": content,
  "testCases": [{input: "10", output: "Girdiğiniz sayı çift bir sayıdır.\n"}, {input: "101", output: "Girdiğiniz sayı tek bir sayıdır.\n"}, {input: "1110", output: "Girdiğiniz sayı çift bir sayıdır.\n"}]

}
