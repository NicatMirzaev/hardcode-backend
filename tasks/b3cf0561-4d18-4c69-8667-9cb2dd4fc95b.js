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

*Bu sefer ki görev de amacınız kullanıcıdan input olarak bir sayı almak. Daha sonra aldığınız bu sayının tek tek ekrana 2 ile çarpmasını, toplamasını, bölmesini ve çıkarmasını yazın.*

**Örnek**

*Eğer kullanıcı inputa 6 yazarsa ekrana tek tek 12, 8, 3 ve 4 yazmalısınız.*
`
module.exports = {
  "languages": {
    "python": ""
  },
  "content": content,
  "testCases": [{input: "10", output: "20.0\n12.0\n5.0\n8.0\n"}, {input: "51", output: "102.0\n53.0\n25.5\n49.0\n"}, {input: "25.5", output: "51.0\n27.5\n12.75\n23.5\n"}]

}
