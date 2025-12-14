fetch("pdcs_a1_sample.json")
.then(r=>r.json())
.then(d=>{
  WORDS = {};
  const dict = d.dictionary || d;
  Object.values(dict).forEach(e=>{
    if(!e.word) return;
    WORDS[e.word.toLowerCase()] = {
      fa: e.fa || "",
      def: e.en || e.definition || "",
      exEn: e.examples?.[0]?.en || "",
      exFa: e.examples?.[0]?.fa || ""
    };
  });
});
