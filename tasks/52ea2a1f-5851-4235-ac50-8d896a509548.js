const javaCode = `public class myClass {
  public static void main(String args[]) {
  }
}
`
const c_plus_plus_code = `#include <iostream>
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
module.exports = {
  "languages": {
    "Python": "",
    "NodeJS": "",
    "Java": javaCode,
    "c_plus_plus": c_plus_plus_code,
    "c_sharp": csharpCode

  },
  "content": "Hello World!",

}
