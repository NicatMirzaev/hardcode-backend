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
const content = `**Hoşgeldiniz!**

*İlk Python görevine hoş geldin! merak etme, ilk görevden seni zorlamayacağız :). Tüm programlama dillerinde ilk örnek olarak, 'Hello World!' yani 'Merhaba Dünya' kullanılır. \
Bu görev de tek yapman gereken ekrana 'Hello World!' yazısını yazdırmaktır. Kodu yazdıktan sonra "Çalıştır" butonuna tıklaman yeterli, gerisini senin için halledeceğiz.*

`
module.exports = {
  "languages": {
    "python": ""
  },
  "content": content,
  "testCases": [{input: "", output: "Hello World!\n"}]

}
