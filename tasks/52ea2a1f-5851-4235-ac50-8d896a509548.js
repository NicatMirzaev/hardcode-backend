const javaCode = `public class myClass {
  public static void main(String args[]) {
  }
}
`
const c_cpp = `#include <iostream>
int main() {
  return 0;
}
`
const csharpCode = `using System;

public class Program
{
    public static void Main(string[] args)
    {
    }
}
`
const content = `**Hoşgeldiniz!**

*İlk Python görevine hoş geldin! merak etme, ilk görevden seni zorlamayacağız :). Tüm programlama dillerinde ilk örnek olarak, 'Hello World!' yani 'Merhaba Dünya' kullanılır. \
Bu görev de tek yapman gereken ekrana 'Hello World!' yazısını yazdırmaktır. Kodu yazdıktan sonra "Çalıştır" butonuna tıklaman yeterli, gerisini senin için halledeceğiz.*

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
  "testCases": [{input: "", output: "Hello World!\n"}]

}
