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

*Bu sefer ki görev de amacınız kullanıcıdan input olarak bir sayı almak. Daha sonra aldığınız bu sayının negatif veya pozitif olduğunu kullanıcıya bildirmelisiniz. \
Eğer pozitif ise ekrana "Bu sayı pozitif bir sayıdır." yazdırmalısınız. Eğer negatif ise "Bu sayı negatif bir sayıdır." yazdırmalısınız. Eğer 0 ise yani ne negatif ne de pozitif ekrana "Bu sayı ne negatif ne de pozitifdir." yazdırın.*

**Örnek**

*Eğer kullanıcı inputa 6 yazarsa ekrana "Bu sayı pozitif bir sayıdır." yazmalısınız.*
`
module.exports = {
  "languages": {
    "python": ""
  },
  "content": content,
  "testCases": [{input: "5", output: "Bu sayı pozitif bir sayıdır.\n"}, {input: "-10", output: "Bu sayı negatif bir sayıdır.\n"}, {input: "0", output: "Bu sayı ne negatif ne de pozitifdir.\n"}]

}
