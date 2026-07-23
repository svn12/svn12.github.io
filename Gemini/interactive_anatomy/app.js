/**
 * Interactive Anatomy Explorer - Core Application JavaScript
 * Built with Web Audio API for feedback, and Pan & Zoom controls.
 */

// ==========================================================================
// 1. Anatomy Database (UBERON/EFO to Detailed Medical Descriptions)
// ==========================================================================
const SYSTEM_INFO = {
  nervous: { name: "神經系統", color: "#8A5A84", rgb: "138, 90, 132" },
  circulatory: { name: "循環系統", color: "#B85C46", rgb: "184, 92, 70" },
  digestive: { name: "消化系統", color: "#C28247", rgb: "194, 130, 71" },
  respiratory: { name: "呼吸系統", color: "#507D80", rgb: "80, 125, 128" },
  endocrine: { name: "內分泌系統", color: "#A3935C", rgb: "163, 147, 92" },
  lymphatic: { name: "淋巴免疫系統", color: "#658E62", rgb: "101, 142, 98" },
  urinary: { name: "泌尿系統", color: "#607590", rgb: "96, 117, 144" },
  reproductive: { name: "生殖系統", color: "#966060", rgb: "150, 96, 96" }
};

// Fallback lookup table to translate title/labels to Chinese names & systems
const fallbackDict = {
  "locus ceruleus": { zh: "藍斑核", system: "nervous", desc: "腦幹中的核心核團，是中樞神經系統中去甲腎上腺素的主要合成源，調控警覺、注意與壓力反應。" },
  "middle temporal gyrus": { zh: "中顳葉皮質", system: "nervous", desc: "顳葉的重要腦回，參與感覺整合、語言理解（特別是單詞語義處理）與視覺記憶。" },
  "middle frontal gyrus": { zh: "額中回", system: "nervous", desc: "額葉前部的重要腦回，與注意力控制、工作記憶以及高級決策制定密切相關。" },
  "pineal body": { zh: "松果體", system: "endocrine", desc: "位於腦部中心的小型內分泌腺，分泌褪黑激素以調控晝夜節律（睡眠-覺醒週期）。" },
  "dura mater": { zh: "硬腦膜", system: "nervous", desc: "包裹腦與脊髓的最外層堅韌纖維膜，提供物理物理防護與靜脈竇引流支持。" },
  "hypothalamus": { zh: "下視丘", system: "nervous", desc: "調節自律神經系統與內分泌的核心腦區，控制體溫、飢餓、口渴與睡眠。" },
  "thalamus": { zh: "視丘", system: "nervous", desc: "感覺訊號的「中繼站」，除了嗅覺外，全身的感官資訊皆在此整合後傳入皮質。" },
  "substantia nigra": { zh: "黑質", system: "nervous", desc: "中腦的關鍵核團，富含多巴胺能神經元，參與運動規劃與多巴胺獎勵機制。" },
  "putamen": { zh: "殼核", system: "nervous", desc: "基底核的一部分，主要協調自主運動的發起，與帕金森氏症病變高度相關。" },
  "globus pallidus": { zh: "蒼白球", system: "nervous", desc: "基底核的輸出部分，對運動指令進行精細調節與抑制。" },
  "meninges": { zh: "腦膜", system: "nervous", desc: "包裹在中樞神經系統外部的三層保護膜，內含腦脊髓液。" },
  "cerebellar hemisphere": { zh: "小腦半球", system: "nervous", desc: "小腦兩側的半球結構，主要協調肢體的精細自主運動與姿勢控制。" },
  "basal forebrain": { zh: "前腦基底部", system: "nervous", desc: "位於大腦底部的結構，包含豐富的乙醯膽鹼能神經元，調控皮質警覺與學習。" },
  "brain ventricle": { zh: "腦室", system: "nervous", desc: "腦內充滿腦脊髓液的互通腔室系統，負責緩衝衝擊與提供代謝通路。" },
  "caudate nucleus": { zh: "尾狀核", system: "nervous", desc: "基底核的重要組成，呈C字形，參與運動控制與認知學習反饋。" },
  "parietal lobe": { zh: "頂葉", system: "nervous", desc: "整合軀體感覺、空間知覺與數學計算的皮質葉區。" },
  "occipital lobe": { zh: "枕葉", system: "nervous", desc: "初級與次級視覺皮質的所在地，專司視覺信號解析與圖形識別。" },
  "pleura": { zh: "胸膜", system: "respiratory", desc: "包覆肺臟與胸腔壁的雙層漿膜，在呼吸時提供低摩擦的滑動介面。" },
  "breast": { zh: "乳房", system: "reproductive", desc: "位於胸前部的腺體器官，受激素調控，在哺乳期分泌乳汁。" },
  "atrium auricular region": { zh: "心房耳", system: "circulatory", desc: "位於心房前上方的錐形小囊袋，可增加心房的容量緩衝。" },
  "coronary artery": { zh: "冠狀動脈", system: "circulatory", desc: "直接分支自主動脈根部，專門為心肌層提供氧氣與營養的動脈網。" },
  "vas deferens": { zh: "輸精管", system: "reproductive", desc: "輸送成熟精子離開附睪，並與精囊分泌物匯合的管道。" },
  "seminal vesicle": { zh: "精囊", system: "reproductive", desc: "分泌富含果糖與蛋白質的黏稠鹼性液體，佔精液總量的約 60%。" },
  "epididymis": { zh: "附睪", system: "reproductive", desc: "緊貼睪丸後方的細長管道，是精子發育成熟與暫時儲存的場所。" },
  "tonsil": { zh: "扁桃體", system: "lymphatic", desc: "咽部的淋巴組織，作為呼吸道與消化道入口的第一道免疫屏障。" },
  "cortex of kidney": { zh: "腎皮質", system: "urinary", desc: "腎臟的外側部，包含腎小體與大部分的腎小管，執行血液過濾與重吸收。" },
  "esophagogastric junction": { zh: "食道胃交界處", system: "digestive", desc: "食道與胃賁門的連接區，設有括約肌防止胃酸逆流。" },
  "heart left ventricle": { zh: "左心室", system: "circulatory", desc: "心臟壁最厚的腔室，負責將充氧血強力泵入主動脈以供應全身體循環。" },
  "caecum": { zh: "盲腸", system: "digestive", desc: "大腸的起始段，下方連接闌尾，是食物殘渣進入結腸的通道。" },
  "ileum": { zh: "迴腸", system: "digestive", desc: "小腸的最後一段，主要吸收維生素B12、膽鹽與剩餘的營養素。" },
  "rectum": { zh: "直腸", system: "digestive", desc: "大腸的末端，暫時儲存糞便，當充盈時會觸發排便反射。" },
  "left cardiac atrium": { zh: "左心房", system: "circulatory", desc: "接收來自肺靜脈充氧血的腔室，隨後將其排入左心室。" },
  "pulmonary valve": { zh: "肺動脈瓣", system: "circulatory", desc: "位於右心室與肺動脈之間的半月瓣，防止血液倒流回心室。" },
  "mitral valve": { zh: "二尖瓣 / 僧帽瓣", system: "circulatory", desc: "位於左心房與左心室之間的雙葉瓣，防止心室收縮時血液反流。" },
  "penis": { zh: "陰莖", system: "reproductive", desc: "男性的排尿與交配器官，內含海綿體血管竇，受自律神經調控充血起勃。" },
  "nasopharynx": { zh: "鼻咽", system: "respiratory", desc: "咽部的上段，位於鼻腔後方，是空氣進出呼吸道的咽喉通路。" },
  "throat": { zh: "咽喉", system: "respiratory", desc: "連通呼吸道與消化道的共同通道，包含吞嚥與發聲的軟骨與肌肉。" },
  "tricuspid valve": { zh: "三尖瓣", system: "circulatory", desc: "位於右心房與右心室之間的三葉瓣，防止收縮期血液倒流回心房。" },
  "diaphragm": { zh: "橫膈膜", system: "respiratory", desc: "分隔胸腔與腹腔的扁平肌肉，是人體最核心的吸氣呼吸肌。" },
  "duodenum": { zh: "十二指腸", system: "digestive", desc: "小腸的第一段，接收胃食糜、膽汁與胰液，是化學消化的關鍵位置。" },
  "small intestine": { zh: "小腸", system: "digestive", desc: "長度約 5-6 米的管狀器官，是食物消化與營養吸收的最主要場所。" },
  "vermiform appendix": { zh: "闌尾", system: "digestive", desc: "盲腸末端的小型盲管，富含淋巴組織，與免疫儲備及共生菌調節有關。" },
  "cartilage element": { zh: "軟骨元件", system: "lymphatic", desc: "人體骨骼與關節系統中的軟骨支持構造，具備彈性與物理支撐力。" },
  "esophagus": { zh: "食道", system: "digestive", desc: "連接咽與胃的肌肉通道，以波浪狀蠕動將食物送入胃中。" },
  "saliva-secreting gland": { zh: "唾液腺", system: "digestive", desc: "分泌含有澱粉酶的唾液，協助口腔內食物的濕潤與初步化學消化。" },
  "parotid gland": { zh: "腮腺", system: "digestive", desc: "最大的唾液腺，位於耳前下方，主要分泌漿液性唾液。" },
  "submandibular gland": { zh: "下頜下腺", system: "digestive", desc: "位於下頜骨下方的唾液腺，分泌混合性唾液。" },
  "nasal septum": { zh: "鼻中膈", system: "respiratory", desc: "分隔兩側鼻腔的骨與軟骨屏障，維持鼻道結構通暢。" },
  "oral cavity": { zh: "口腔", system: "digestive", desc: "消化系統的起點，內含牙齒與舌，負責咀嚼與初步食物濕潤。" },
  "medulla oblongata": { zh: "延腦", system: "nervous", desc: "腦幹的最下部分，維持呼吸與血壓的基本生命反射中樞。" },
  "hypothalamus": { zh: "下視丘", system: "nervous", desc: "調節人體體溫、血糖與水份平衡的核心腦區，控制人體自律神經與內分泌系統。" },
  "thalamus": { zh: "視丘", system: "nervous", desc: "中樞神經系統中除了嗅覺外，所有感覺輸入大腦皮質的核心中繼中樞。" },
  "substantia nigra": { zh: "黑質", system: "nervous", desc: "中腦內合成多巴胺的神經團，主要調控身體的自主運動發起。" },
  "putamen": { zh: "殼核", system: "nervous", desc: "大腦基底核的重要構造，負責調控運動反饋與認知決策。" },
  "globus pallidus": { zh: "蒼白球", system: "nervous", desc: "基底核的運動調節核心，參與肌肉張力控制與動作抑制。" },
  "meninges": { zh: "腦膜", system: "nervous", desc: "包裹在大腦與脊髓外側的三層結締組織保護膜系統。" },
  "cerebellar hemisphere": { zh: "小腦半球", system: "nervous", desc: "負責維持肢體運動的協調性、姿勢與肌肉張力平衡的構造。" },
  "basal forebrain": { zh: "前腦基底部", system: "nervous", desc: "調控大腦皮質喚醒程度與注意力水平的膽鹼能神經元集結區。" },
  "brain ventricle": { zh: "腦室", system: "nervous", desc: "大腦內部生成與循環腦脊髓液的中空腔室系統。" },
  "caudate nucleus": { zh: "尾狀核", system: "nervous", desc: "基底核的組成部分，與大腦的運動調控、認知和多巴胺回報機制相關。" },
  "parietal lobe": { zh: "頂葉", system: "nervous", desc: "大腦皮質頂部，整合身體觸覺、痛覺、溫覺與空間知覺的腦葉。" },
  "occipital lobe": { zh: "枕葉", system: "nervous", desc: "大腦皮質後部，處理視覺訊號、顏色與空間運動知覺的核心中樞。" },
  "hippocampal formation": { zh: "海馬結構", system: "nervous", desc: "顳葉邊緣系統內，負責短期記憶轉化與空間定位的重要結構。" },
  "adrenal gland": { zh: "腎上腺", system: "endocrine", desc: "位於腎臟上方的雙側內分泌器官，分泌皮質醇與腎上腺素以調控壓力。" }
};

const anatomyData = {
  // --- Brain Structures ---
  "UBERON_0000955": {
    zh: "腦",
    en: "Brain",
    system: "nervous",
    overview: "人體中樞神經系統的核心器官，負責調控大部分的生理活動，並作為意識、記憶、思維與情感的物質基礎。腦由數百億個神經元及支持細胞構成，透過極其複雜的突觸網絡進行資訊處理。",
    histology: "包含高度發達的灰質（由神經元胞體及樹突組成）與白質（由髓鞘化的神經纖維組成），外覆三層腦膜，並懸浮於腦脊髓液中以獲得物理緩衝與代謝支持。",
    clinical: "阿茲海默症（進行性神經退化）、腦中風（缺血性或出血性血管病變導致的局部功能受損）、癲癇（大腦異常放電）。",
    stats: [
      { label: "平均重量", value: "約 1.3 - 1.4 kg" },
      { label: "能量消耗", value: "佔人體總靜息耗氧量的 20%" }
    ]
  },
  "UBERON_0002421": {
    zh: "海馬結構",
    en: "Hippocampal Formation",
    system: "nervous",
    overview: "位於大腦顳葉內側深處的邊緣系統構造，包含海馬迴本體、齒狀回與下托。是人類空間記憶導航以及將短期記憶鞏固為長期記憶的絕對核心樞紐。",
    histology: "屬於典型的三層古皮質（Archicortex），主要由密集的錐體細胞與顆粒細胞構成，具有經典的「三突觸迴路」興奮性傳導通路。",
    clinical: "此區域在缺氧或癲癇發作時極易受損。也是阿茲海默症最早出現病理變化（神經纖維糾結與澱粉樣蛋白沉積）並伴隨萎縮的關鍵腦區。",
    stats: [
      { label: "所屬腦區", value: "端腦 / 邊緣系統" },
      { label: "功能特性", value: "神經元再生 (Neurogenesis) 區" }
    ]
  },
  "UBERON_0000956": {
    zh: "大腦皮質",
    en: "Cerebral Cortex",
    system: "nervous",
    overview: "覆蓋於大腦半球表面的灰質薄層，是人類最高級認知功能（包括語言、邏輯推理、複雜計劃、感覺感知及意志運動控制）的控制中樞。其高度褶皺的外觀（溝與回）極大地增加了皮質的表面積。",
    histology: "典型結構為發育完善的六層新皮質（Neocortex）層狀結構，各層分佈著不同類型的錐體細胞與顆粒細胞，執行複雜的傳入、整合與傳出功能。",
    clinical: "皮質功能定位損傷可導致失語症（語言功能障礙）、失用症或特異性感覺喪失。阿茲海默症早期亦伴隨廣泛的皮質萎縮。",
    stats: [
      { label: "皮質厚度", value: "1.5 - 4.5 mm" },
      { label: "神經元數量", value: "約 160 億個" }
    ]
  },
  "UBERON_0001870": {
    zh: "額葉",
    en: "Frontal Lobe",
    system: "nervous",
    overview: "位於大腦半球的前部，是人類最發達的腦區。主要負責高級認知功能、自主運動的發起、語言表達（布羅卡區）、工作記憶、決策制定以及個性的塑造與社會行為的調控。",
    histology: "包含了前運動區、初級運動皮質以及高度特化的高級前額葉皮質（Prefrontal Cortex），擁有豐富的多巴胺投射網絡。",
    clinical: "額葉受損（如 Phineas Gage 著名案例）會導致人格劇變、社會抑制力喪失、計劃能力缺陷以及運動性失語症。",
    stats: [
      { label: "佔大腦半球比例", value: "約 35% - 41%" },
      { label: "主要神經遞質", value: "多巴胺 (Dopamine)" }
    ]
  },
  "UBERON_0001871": {
    zh: "顳葉",
    en: "Temporal Lobe",
    system: "nervous",
    overview: "位於大腦半球的外側下方，是聽覺資訊處理的核心區域。同時在語言理解（韋尼克區）、長期記憶的整合（包含海馬迴結構）、視覺物體識別（如人臉識別）以及情感反應中扮演關鍵角色。",
    histology: "包含了初級聽覺皮質、外側顳葉聯合皮質，以及內側的邊緣系統結構（海馬結構與杏仁核）。",
    clinical: "顳葉癲癇常伴隨幻聽或強烈的既視感。韋尼克失語症患者能夠流利說話，但言語失去意義且無法理解他人說話。",
    stats: [
      { label: "主要皮質區", value: "聽覺皮質 (Brodmann 41/42)" },
      { label: "臨床關聯", value: "顳葉癲癇、感覺性失語症" }
    ]
  },
  "UBERON_0001872": {
    zh: "頂葉",
    en: "Parietal Lobe",
    system: "nervous",
    overview: "位於大腦半球的中後部，主要負責整合來自全身的軀體感覺資訊（包括觸覺、痛覺、溫度覺與本體感覺），並在空間感知、三維定位、數學計算以及注意力的指向中發揮重要作用。",
    histology: "前部為中央後回，即初級軀體感覺皮質，呈現「感覺小人」的精確空間映射；後部為軀體感覺聯合皮質，進行高級空間資訊整合。",
    clinical: "優勢半球頂葉受損可導致 Gerstmann 症候群（失算、失寫、左右失認及手指失認）；非優勢半球（通常為右側）受損則會導致空間忽略症（Neglect syndrome）。",
    stats: [
      { label: "主要區域", value: "初級軀體感覺皮質 (S1)" },
      { label: "生理功能", value: "感覺整合、空間導航" }
    ]
  },
  "UBERON_0002021": {
    zh: "枕葉",
    en: "Occipital Lobe",
    system: "nervous",
    overview: "位於大腦半球的後部，是視覺資訊處理的專屬中樞。負責接收來自視網膜經外側膝狀體傳導的視覺信號，並將其解析為色彩、形狀、深度、運動等視覺元素，最終形成視覺意識。",
    histology: "包含了紋狀皮質（Striate cortex，初級視覺皮質 V1）與紋外皮質（V2, V3, V4, V5/MT 等），具有高度規整的柱狀功能結構（皮質柱）。",
    clinical: "雙側初級視覺皮質受損會導致皮質盲，患者眼球結構完好卻無法看見任何事物，部分患者可能出現 Anton 症候群（否認自己失明）。",
    stats: [
      { label: "視覺中樞", value: "初級視覺皮質 (V1 / BA17)" },
      { label: "主要血流供應", value: "大腦後動脈 (PCA)" }
    ]
  },
  "UBERON_0002037": {
    zh: "小腦",
    en: "Cerebellum",
    system: "nervous",
    overview: "位於大腦半球後下方，腦幹的背側。雖然體積僅佔全腦的十分之一，卻容納了全腦半數以上的神經元。主要功能是協調自主運動、維持身體平衡與姿勢、調節肌肉張力，並參與運動技能的學習與程序性記憶。",
    histology: "具有極其規整的三層皮質結構（分子層、浦金氏細胞層、顆粒層）。巨大且分支繁茂的浦金氏細胞（Purkinje cells）是小腦唯一的輸出神經元。",
    clinical: "小腦病變（如小腦萎縮症或急性酒精中毒）會導致小腦性共濟失調，表現為步態蹣跚、意向性震顫、言語含糊（吟詩狀語言）以及眼球震顫。",
    stats: [
      { label: "神經元比例", value: "佔全腦神經元總數的 50% 以上" },
      { label: "輸出細胞", value: "浦金氏細胞 (Purkinje cells)" }
    ]
  },
  "UBERON_0001954": {
    zh: "海馬迴",
    en: "Hippocampus",
    system: "nervous",
    overview: "邊緣系統的重要組成部分，位於顳葉內側深處。是長期記憶整合與空間導航的核心構造，通常與周邊的海馬結構共同運作。",
    histology: "古皮質結構，具有齒狀回與 CA 區，在認知與記憶鞏固方面具備高度可塑性。",
    clinical: "與空間定位喪失、近事記憶缺失、早老性痴呆症 (AD) 的病理退化密切相關。",
    stats: [
      { label: "所屬系統", value: "邊緣系統" },
      { label: "生理作用", value: "記憶轉化與空間定位" }
    ]
  },
  "UBERON_0001876": {
    zh: "杏仁核",
    en: "Amygdala",
    system: "nervous",
    overview: "位於顳葉內側、海馬迴前端的杏仁狀核團群，是情緒處理（特別是恐懼、焦慮與憤怒）的核心中樞。負責評估環境中的潛在威脅，觸發「戰或逃」的自主神經反應，並參與情感記憶的編碼與儲存。",
    histology: "由多個結構和功能不同的核團組成，主要分為基底外側核群（負責接收多種感覺輸入）和中央核（負責向腦幹和下視丘發出輸出信號以調控自主神經反應）。",
    clinical: "雙側杏仁核毀損會導致庫爾-布西症候群（Klüver-Bucy syndrome），表現為恐懼感喪失、過度探索、性取向異常及口唇傾向。焦慮症與創傷後壓力症候群（PTSD）通常伴隨杏仁核的過度活躍。",
    stats: [
      { label: "解剖位置", value: "顳葉深處，海馬迴前下方" },
      { label: "臨床特徵", value: "恐懼調控、情感記憶" }
    ]
  },
  "UBERON_0001897": {
    zh: "視丘",
    en: "Thalamus",
    system: "nervous",
    overview: "位於大腦中心、第三腦室兩側的巨大雙側卵圓形灰質核團。被稱為「大腦的中轉站」，除了嗅覺外，全身所有的感覺輸入（視覺、聽覺、觸覺等）都必須在視丘進行接替與初步整合，隨後才能投射至對應的大腦皮質區。",
    histology: "由數十個特定功能核團（如外側膝狀體負責視覺，內側膝狀體負責聽覺）組成，擁有與大腦皮質互為迴路的點對點雙向纖維聯繫。",
    clinical: "視丘梗塞或損傷可導致「視丘痛症候群」（Dejerine-Roussy syndrome），表現為對側身體出現難以忍受的自發性劇烈灼痛，並伴隨感覺喪失或異常。",
    stats: [
      { label: "主要核團", value: "外側膝狀體 (LGB)、內側膝狀體 (MGB)" },
      { label: "核心功能", value: "感覺中繼、意識與自律警覺" }
    ]
  },
  "UBERON_0001898": {
    zh: "下視丘",
    en: "Hypothalamus",
    system: "nervous",
    overview: "位於視丘下方、腦幹上方的微小區域。是維持人體內環境穩定（Homeostasis）的最高整合中樞，負責調節體溫、血糖、滲透壓、攝食與飲水行為、晝夜節律（生物鐘），並直接通過控制垂體來調控整個人體的內分泌系統。",
    histology: "包含許多精細的核團，如視交叉上核（晝夜節律中心）、視上核與室旁核（合成抗利尿激素與催產素）。其下端通過垂體柄與腦垂腺相連。",
    clinical: "下視丘病變會引發廣泛的系統紊亂，包括體溫調節失常（持續高熱或體溫過低）、尿崩症（抗利尿激素缺乏導致的多尿）、肥胖症或睡眠障礙。",
    stats: [
      { label: "體積比例", value: "僅佔全腦總體積的 0.3%" },
      { label: "控制軸線", value: "HPA 軸 (下視丘-腦垂腺-腎上腺軸)" }
    ]
  },
  "UBERON_0001896": {
    zh: "延腦",
    en: "Medulla Oblongata",
    system: "nervous",
    overview: "腦幹的最下部分，上接腦橋，下連脊髓。雖然體積細小，卻是維持生命運行的最關鍵結構，內含調控心跳、血壓、呼吸等基本生命表徵的反射中樞，常被稱為「生命中樞」。",
    histology: "包含了控制呼吸的基本神經元網絡、心血管調控中樞、以及多條上行與下行神經傳導束的交叉處（如錐體交叉，這決定了左腦控制右側身體的交叉支配原則）。",
    clinical: "延腦局部的微小缺血或物理壓迫（如枕骨大孔疝）都會導致心跳驟停或呼吸抑制，迅速危及生命。常見相關疾病包括延腦外側症候群（Wallenberg syndrome）。",
    stats: [
      { label: "重要中樞", value: "呼吸反射中樞、心血管調控中樞" },
      { label: "出顱神經", value: "包含第 IX, X, XI, XII 對腦神經核" }
    ]
  },
  "UBERON_0000007": {
    zh: "腦垂腺",
    en: "Pituitary Gland",
    system: "endocrine",
    overview: "位於顱底蝶鞍內的紅褐色卵圓形微小腺體。被尊稱為「內分泌系統的主宰腺」，負責分泌多種促激素，以直接調控甲狀腺、腎上腺、性腺等其他內分泌腺的活動，並分泌生長激素調控人體發育。",
    histology: "結構上分為腺垂體（前葉，由上皮細胞構成，合成與釋放 TSH, ACTH, LH, FSH, GH, PRL）與神經垂體（後葉，由神經分泌軸突構成，儲存並釋放抗利尿激素 ADH 及催產素）。",
    clinical: "垂體腺瘤是常見腫瘤，可引發肢端肥大症（生長激素過多）、庫欣氏病（促腎上腺皮質激素過多）或壓迫視交叉導致雙顳側偏盲。",
    stats: [
      { label: "平均大小", value: "約如一顆豌豆 (直徑約 1 cm)" },
      { label: "平均重量", value: "0.5 - 0.6 g" }
    ]
  },

  // --- Male Body Structures ---
  "UBERON_0000948": {
    zh: "心臟",
    en: "Heart",
    system: "circulatory",
    overview: "循環系統的動力核心，是一個由強壯的肌肉構成的泵。通過有節律的收縮與舒張，推動血液在全身血管網路中流動，為身體各組織提供氧氣與營養物質，並帶走二氧化碳和代謝廢物。",
    histology: "主要由心肌細胞（Cardiomyocytes）構成，具有不自主的自律性收縮特徵。心壁由外向內分為心外膜、心肌層與心內膜，內部包含四個腔室與防止血液倒流的心臟瓣膜系統。",
    clinical: "冠狀動脈心臟病（血管阻塞導致心肌缺血）、心肌梗塞、心律不整、慢性心臟衰竭。",
    stats: [
      { label: "每分鐘輸出量", value: "約 5 L (靜息狀態)" },
      { label: "一生總搏動次數", value: "約 25 - 30 億次" }
    ]
  },
  "UBERON_0000947": {
    zh: "主動脈",
    en: "Aorta",
    system: "circulatory",
    overview: "人體中最大、最粗的動脈血管。直接與心臟的左心室相連，承受來自心臟泵血的高壓衝擊，將富含氧氣的動脈血分配至全身各級分支動脈，是體循環的總源頭。",
    histology: "屬於典型彈性動脈（Elastic artery），管壁中膜含有極為豐富的彈性纖維與平滑肌，這使主動脈能夠在大腦或肢體收縮期擴張緩衝高壓，在舒張期彈性回縮以維持血流的持續流動。",
    clinical: "主動脈瘤（管壁病理性擴張面臨破裂危險）、主動脈剝離（管壁內膜撕裂導致血液湧入中膜，致死率極高的急症）、主動脈粥狀硬化。",
    stats: [
      { label: "起始段直徑", value: "約 2.5 - 3.0 cm" },
      { label: "承受壓力", value: "收縮壓約 120 mmHg" }
    ]
  },
  "UBERON_0002107": {
    zh: "肝臟",
    en: "Liver",
    system: "digestive",
    overview: "人體內最大的內臟器官與化學工廠。執行超過 500 種關鍵生理功能，包括代謝碳水化合物、脂肪與蛋白質，解毒藥物與毒素，儲存維生素與糖原，合成血漿蛋白（如白蛋白與凝血因子），以及分泌膽汁以協助脂肪消化。",
    histology: "以肝小葉（Liver lobule）為基本結構與功能單位。肝細胞呈放射狀排列成肝板，中間為中央靜脈，板間為充滿混合血流（來自肝動脈與門靜脈）的肝血竇，使物質交換效率最大化。",
    clinical: "病毒性肝炎、肝硬化（肝組織纖維化導致門脈高壓與腹水）、脂肪肝、肝細胞癌。",
    stats: [
      { label: "平均重量", value: "約 1.2 - 1.5 kg" },
      { label: "血流量", value: "每分鐘約 1.4 L (佔心輸出量 25%)" }
    ]
  },
  "UBERON_0002048": {
    zh: "肺臟",
    en: "Lung",
    system: "respiratory",
    overview: "呼吸系統的核心器官，成對位於胸腔內。主要負責氣體交換，即吸入大氣中的氧氣並使其擴散進入血液，同時將血液中代謝產生的二氧化碳排出體外，以維持體內酸鹼平衡與血氧濃度。",
    histology: "由支氣管樹的不斷分支末端連接的數億個微小肺泡（Alveoli）組成。肺泡壁極薄，由 I 型與 II 型肺泡上皮細胞構成，周圍纏繞著極其豐富的毛細血管網，共同構成氣體擴散的「呼吸膜」。",
    clinical: "肺炎（肺泡急性發炎滲出）、慢性阻塞性肺病（COPD）、氣喘、肺纖維化、肺癌。",
    stats: [
      { label: "肺泡總表面積", value: "約 70 - 100 平方公尺" },
      { label: "肺泡總數", value: "約 3 - 5 億個" }
    ]
  },
  "UBERON_0002113": {
    zh: "腎臟",
    en: "Kidney",
    system: "urinary",
    overview: "成對的蠶豆狀腹膜後器官。是人體泌尿系統的基石，主要負責過濾血液以移除含氮廢物（尿素、肌酐等），精確調控水份、電解質（鈉、鉀、鈣）平衡與酸鹼度，並分泌紅血球生成素（EPO）及腎素以調節造血與血壓。",
    histology: "每個腎臟包含約 100 萬個腎元（Nephron）。腎元由腎小體（腎小球與鮑氏囊，負責過濾）及腎小管（負責重吸收與分泌）組成。",
    clinical: "急性腎損傷、慢性腎臟病（最終導致尿毒症，需依賴透析或腎移植）、腎結石、糖尿病腎病變。",
    stats: [
      { label: "每日過濾血漿量", value: "約 180 L" },
      { label: "每日最終排尿量", value: "約 1.5 L" }
    ]
  },
  "UBERON_0000945": {
    zh: "胃",
    en: "Stomach",
    system: "digestive",
    overview: "消化道中呈袋狀膨大的部分，位於食道與十二指腸之間。負責暫時儲存食物，並透過強烈的肌肉蠕動進行機械性研磨，同時分泌極強酸性的胃液與胃蛋白酶，開啟蛋白質的化學性消化，將食物轉化為半流體的食糜。",
    histology: "胃壁具有發達的平滑肌層（內斜、中環、外縱三層）。黏膜表面有密集的胃小凹，內含壁細胞（分泌胃酸與內因子）、主細胞（分泌胃蛋白酶原）與黏液細胞（分泌保護性黏液屏障）。",
    clinical: "胃潰瘍（黏膜保護屏障受損遭胃酸侵蝕）、胃食道逆流、幽門螺桿菌感染、胃癌。",
    stats: [
      { label: "靜息容量", value: "約 50 mL" },
      { label: "充盈後最大容量", value: "約 1.5 - 2.0 L" }
    ]
  },
  "UBERON_0001264": {
    zh: "胰臟",
    en: "Pancreas",
    system: "digestive",
    overview: "開展於胃後方的狹長橫行腺體，兼具外分泌與內分泌功能的雙重器官。外分泌部產生強效消化酶並分泌至十二指腸；內分泌部（胰島）直接釋放胰島素與升糖素進入血液，是調節血糖濃度的核心器官。",
    histology: "外分泌部由漿液性腺泡構成，分泌胰澱粉酶、胰脂肪酶與胰蛋白酶原；內分泌部為散在的胰島（Islets of Langerhans），其中 Beta 細胞佔多數（分泌胰島素），Alpha 細胞分泌升糖素。",
    clinical: "糖尿病（胰島素絕對或相對不足導致的高血糖）、急性胰臟炎（消化酶在胰腺內被異常激活導致自我消化）、胰臟癌（高度惡性且難以早期發現）。",
    stats: [
      { label: "胰島數量", value: "約 100 - 200 萬個" },
      { label: "外分泌液日產量", value: "約 1.0 - 1.5 L" }
    ]
  },
  "UBERON_0002106": {
    zh: "脾臟",
    en: "脾臟",
    system: "lymphatic",
    overview: "人體最大的淋巴器官，位於左上腹部。扮演「血液過濾器」的角色，負責清除衰老紅血球與病原體，儲存血小板與白血球，並在受到病原體侵襲時啟動特異性免疫反應。",
    histology: "由紅髓與白髓構成。紅髓充滿血竇與脾索，負責物理過濾並吞噬衰老紅血球；白髓由密集的淋巴組織構成，富含 T 細胞與 B 細胞，是免疫應答的發生地。",
    clinical: "脾臟腫大（常繼發於肝硬化門脈高壓或血液腫瘤）。脾臟血流極為豐富且質地脆弱，嚴重的腹部外傷極易導致脾破裂，引發致命性大出血。",
    stats: [
      { label: "儲血量", value: "約佔全身血小板總數的 30%" },
      { label: "生理常態", value: "非生命必需器官，切除後易發生嚴重感染" }
    ]
  },
  "UBERON_0002110": {
    zh: "膽囊",
    en: "Gallbladder",
    system: "digestive",
    overview: "位於肝臟下方右側的梨形中空器官。自身不製造膽汁，但負責濃縮並儲存由肝臟持續分泌的膽汁。當含有脂肪的食糜進入十二指腸時，膽囊受膽囊收縮素（CCK）刺激而劇烈收縮，將膽汁排入腸道以協助脂肪的乳化與吸收。",
    histology: "管壁無黏膜下層，黏膜具有高度褶皺以利水分的吸收與膽汁的濃縮，肌層發達，受植物神經與激素的高敏感性調控。",
    clinical: "膽結石（膽固醇或膽色素結晶析出）、急性膽囊炎、膽絞痛（結石阻塞膽囊管引發的劇烈絞痛）。",
    stats: [
      { label: "儲存容量", value: "約 30 - 50 mL" },
      { label: "膽汁濃縮倍數", value: "最高可濃縮 5 - 10 倍" }
    ]
  },
  "UBERON_0001155": {
    zh: "大腸",
    en: "Colon",
    system: "digestive",
    overview: "消化道的末端部分，連接小腸並延伸至肛門。主要負責進一步吸收食物殘渣中的水分、無機鹽，並利用豐富的腸道共生菌群發酵未消化的碳水化合物，最終將殘渣塑造成糞便並暫時儲存以待排出。",
    histology: "缺乏小腸的絨毛結構，但含有極其豐富的分泌黏液的杯狀細胞，以保護腸壁並潤滑糞便。管壁具有特徵性的結腸帶、結腸袋與腸脂垂。",
    clinical: "大腸激躁症（IBS）、潰瘍性結腸炎、大腸息肉（腺瘤性息肉具癌變風險）、大腸直腸癌。",
    stats: [
      { label: "長度", value: "約 1.5 m" },
      { label: "細菌數量", value: "約 100 兆個共生菌" }
    ]
  },
  "UBERON_0002108": {
    zh: "小腸",
    en: "Small Intestine",
    system: "digestive",
    overview: "消化道中最長的一段，是人體消化食物與吸收營養物質的最核心場所。幾乎所有的碳水化合物、脂肪、蛋白質、維生素與水分都在此處被徹底分解並吸收到血液或淋巴系統中。",
    histology: "為了極大化吸收面積，小腸黏膜形成了特化的環狀褶皺（Plicae circulares）、絨毛（Villi）以及細胞表面的微絨毛（Microvilli），使總接觸面積擴大數百倍。",
    clinical: "乳糜瀉（對麩質過敏導致的小腸絨毛萎縮）、克隆氏症（慢性發炎性腸道疾病）、小腸梗阻。",
    stats: [
      { label: "長度", value: "約 5 - 6 m (活體狀態下約 3 m)" },
      { label: "總吸收面積", value: "約 250 平方公尺 (如一個網球場)" }
    ]
  },
  "UBERON_0002046": {
    zh: "甲狀腺",
    en: "Thyroid Gland",
    system: "endocrine",
    overview: "位於頸部氣管前方、形似蝴蝶的雙葉內分泌腺。合成並分泌甲狀腺素（T3 和 T4），主要作用是調控人體全身細胞的基礎代謝率、產熱作用，並在嬰幼兒時期的骨骼發育與大腦神經系統發育中扮演關鍵角色。",
    histology: "由無數的甲狀腺濾泡（Thyroid follicles）構成。濾泡腔內充滿富含膠質的甲狀腺球蛋白。濾泡旁細胞（C 細胞）分泌降鈣素以降低血鈣濃度。",
    clinical: "甲狀腺功能亢進（縮寫甲亢，如葛雷夫茲氏病）、甲狀腺功能減退（縮寫甲減，如橋本氏甲狀腺炎）、結節性甲狀腺腫、甲狀腺癌。",
    stats: [
      { label: "平均重量", value: "約 15 - 25 g" },
      { label: "核心原料", value: "碘 (Iodine)" }
    ]
  },
  "UBERON_0002369": {
    zh: "腎上腺",
    en: "Adrenal Gland",
    system: "endocrine",
    overview: "一對三角形小器官，分別位於兩側腎臟的上方。是應對身體壓力與維持代謝平衡的關鍵內分泌腺，分別合成並釋放皮質醇、醛固酮以及用於啟動全身緊急「戰或逃」反應的腎上腺素。",
    histology: "解剖上分為外側的皮質與內側的髓質。皮質由外向內細分為球狀帶（分泌醛固酮）、束狀帶（分泌皮質醇）和網狀帶（分泌雄激素）；髓質則由嗜鉻細胞組成，分泌腎上腺素與去甲腎上腺素。",
    clinical: "庫欣氏症候群（皮質醇過多導致向心性肥胖與高血壓）、愛迪生氏病（腎上腺皮質功能不全導致皮膚色素沉著與低血壓）、嗜鉻細胞瘤（髓質腫瘤引發陣發性惡性高血壓）。",
    stats: [
      { label: "解剖構造", value: "腎上腺皮質 (80%) + 腎上腺髓質 (20%)" },
      { label: "核心激素", value: "皮質醇 (Cortisol)、腎上腺素 (Epinephrine)" }
    ]
  },
  "UBERON_0003126": {
    zh: "氣管",
    en: "Trachea",
    system: "respiratory",
    overview: "連接喉部與支氣管的彈性管狀通道，是空氣進出肺部的必經幹道。其管壁具有支撐性結構以防止吸氣時管腔塌陷，同時具有黏膜過濾機制以淨化吸入的空氣。",
    histology: "管壁含有 16-20 個「C」字形的軟骨環以維持通暢。內壁覆蓋假復層纖毛柱狀上皮，上皮細胞間的杯狀細胞分泌黏液以阻擋灰塵，纖毛則向喉部方向擺動，將痰液排出。",
    clinical: "氣管炎、氣管狹窄、異物吸入阻塞。在嚴重氣道阻塞時需進行緊急「氣管切開術」（Tracheotomy）。",
    stats: [
      { label: "長度", value: "約 10 - 12 cm" },
      { label: "直徑", value: "約 2.0 - 2.5 cm" }
    ]
  },
  "UBERON_0001043": {
    zh: "食道",
    en: "Esophagus",
    system: "digestive",
    overview: "一條連接咽部與胃部的肌肉質管道。不具備消化與吸收功能，純粹是食物輸送的物理通道，透過協調的、波浪狀的肌肉蠕動收縮將吞嚥的食物送入胃中。",
    histology: "黏膜上皮為耐磨損的未角化複層擺平上皮。管壁肌層具有特徵性的漸變：上 1/3 為骨骼肌（受意志控制），中 1/3 為混合肌，下 1/3 為平滑肌。",
    clinical: "胃食道逆流病（GERD，胃酸腐蝕食道下端黏膜）、食道靜脈曲張（肝硬化門脈高壓的嚴重併發症，破裂可致命）、食道癌。",
    stats: [
      { label: "平均長度", value: "約 25 cm" },
      { label: "括約肌", value: "食道上括約肌 (UES) & 食道下括約肌 (LES)" }
    ]
  },
  "UBERON_0001255": {
    zh: "尿囊 / 膀胱",
    en: "Urinary Bladder",
    system: "urinary",
    overview: "一個位於骨盆腔底部的中空肌肉器官。主要功能是暫時儲存由輸尿管持續運送而來的尿液，當尿液累積到一定容量時，壁內牽張感受器發送信號至中樞，引發排尿反射，排出尿液。",
    histology: "內壁覆蓋獨特的「移形上皮」（Transition epithelium），能夠在充盈時平滑地伸展變薄而不致漏液。管壁擁有發達的逼尿肌（Detrusor muscle），收縮時可排出尿液。",
    clinical: "膀胱炎（常見的尿路感染，女性因尿道短更易發生）、尿失禁、膀胱結石、膀胱癌。",
    stats: [
      { label: "正常尿意容量", value: "約 200 - 300 mL" },
      { label: "最大生理容量", value: "可達 800 - 1000 mL" }
    ]
  },
  "UBERON_0000473": {
    zh: "睪丸",
    en: "Testis",
    system: "reproductive",
    overview: "男性的主要性腺，成對懸掛於陰囊內。具有雙重生理功能：外分泌功能負責製造精子（Spermatogenesis），內分泌功能則負責合成並分泌以睪固酮（Testosterone）為主的雄性激素以維持男性第二性徵。",
    histology: "內部包含數百條高度盤繞的曲細精管（Seminiferous tubules），其壁上有支持細胞（Sertoli cells）以撫育發育中的精子；管間的間質細胞（Leydig cells）合成睪固酮。",
    clinical: "睪丸扭轉（急症，需在數小時內復位以防壞死）、隱睪症、睪丸癌。",
    stats: [
      { label: "每日精子產量", value: "約數千萬至上億個" },
      { label: "平均體積", value: "每個約 15 - 25 mL" }
    ]
  },
  "UBERON_0000029": {
    zh: "淋巴結",
    en: "Lymph Node",
    system: "lymphatic",
    overview: "分佈於全身淋巴管網絡路徑上的豆狀小結構造。作為淋巴液的過濾站，負責清除淋巴液中的細胞碎屑、異物與病原體，並為免疫細胞（T 細胞和 B 細胞）提供相互接觸與激活的場所，是體液免疫的發源地。",
    histology: "外覆結締組織被膜，內部由外向內分為皮質（含有大量 B 細胞聚集的淋巴濾泡）、副皮質區（主要是 T 細胞）與髓質（含有吞噬細胞）。",
    clinical: "淋巴結腫大（常繼發於局部感染或惡性腫瘤的轉移，如乳癌之腋下淋巴結轉移）、淋巴瘤。",
    stats: [
      { label: "全身總數", value: "約 500 - 600 個" },
      { label: "正常大小", value: "一般直徑小於 1 cm" }
    ]
  }
};

// ==========================================================================
// 2. Physical Sound Synthesizer (Web Audio API)
// ==========================================================================
class SoundSynthesizer {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    } catch (e) {
      console.warn("Web Audio API not supported in this browser");
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  createNode() {
    this.init();
    if (!this.ctx || this.muted) return null;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  playHover() {
    const ctx = this.createNode();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.008);

    gain.gain.setValueAtTime(0.015, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.008);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.01);
  }

  playClick() {
    const ctx = this.createNode();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const noiseNode = this.createNoiseNode(ctx);
    const gain = ctx.createGain();

    osc.connect(gain);
    if (noiseNode) {
      noiseNode.connect(gain);
      noiseNode.start(ctx.currentTime);
      noiseNode.stop(ctx.currentTime + 0.02);
    }
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.06);

    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.07);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.07);
  }

  playSuccess() {
    const ctx = this.createNode();
    if (!ctx) return;

    const now = ctx.currentTime;
    const tones = [523.25, 659.25];
    tones.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.08, now + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.4);
      
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.45);
    });
  }

  playFailure() {
    const ctx = this.createNode();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(130, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(70, ctx.currentTime + 0.25);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(250, ctx.currentTime);
    
    osc.disconnect(gain);
    osc.connect(filter);
    filter.connect(gain);

    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  }

  createNoiseNode(ctx) {
    const bufferSize = ctx.sampleRate * 0.02;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1000;
    filter.Q.value = 2;
    
    noise.connect(filter);
    return noise;
  }
}

const sound = new SoundSynthesizer();

// ==========================================================================
// 3. SVG Pan & Zoom Controller (Interactive Viewport)
// ==========================================================================
class SvgController {
  constructor(viewportEl, containerEl, onSelectCallback, onHoverCallback) {
    this.viewport = viewportEl;
    this.container = containerEl;
    this.onSelect = onSelectCallback;
    this.onHover = onHoverCallback;

    this.panX = 0;
    this.panY = 0;
    this.zoom = 1;
    this.isDragging = false;
    this.startX = 0;
    this.startY = 0;

    this.currentSvg = null;
    this.setupListeners();
  }

  loadSvg(svgTemplateId) {
    const template = document.getElementById(svgTemplateId);
    if (!template) return;

    const clone = template.querySelector('svg').cloneNode(true);
    this.container.innerHTML = '';
    this.container.appendChild(clone);
    this.currentSvg = clone;

    this.initializeSvgElements();
    this.resetView();
  }

  initializeSvgElements() {
    if (!this.currentSvg) return;

    const hiddenElements = this.currentSvg.querySelectorAll('[visibility="hidden"]');
    hiddenElements.forEach(el => {
      el.removeAttribute('visibility');
    });

    const targetElements = this.currentSvg.querySelectorAll('[id^="UBERON_"], [id^="EFO_"], [id^="OTHERS_"]');
    targetElements.forEach(el => {
      if (el.style) {
        el.style.removeProperty('fill');
        el.style.removeProperty('stroke');
        el.style.removeProperty('visibility');
      }
      
      const childPaths = el.querySelectorAll('path, polygon, ellipse, circle, rect');
      childPaths.forEach(cp => {
        if (cp.style) {
          cp.style.removeProperty('fill');
          cp.style.removeProperty('stroke');
          cp.style.removeProperty('visibility');
        }
      });

      el.addEventListener('mouseenter', (e) => this.handleMouseEnter(e, el));
      el.addEventListener('mouseleave', (e) => this.handleMouseLeave(e, el));
      el.addEventListener('mousemove', (e) => this.handleMouseMove(e));
      el.addEventListener('click', (e) => this.handleClick(e, el));
    });
  }

  setupListeners() {
    this.viewport.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      if (e.target.closest('[id^="UBERON_"], [id^="EFO_"], [id^="OTHERS_"]')) return;
      
      this.isDragging = true;
      this.startX = e.clientX - this.panX;
      this.startY = e.clientY - this.panY;
      this.viewport.style.cursor = 'grabbing';
      e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      this.panX = e.clientX - this.startX;
      this.panY = e.clientY - this.startY;
      this.updateTransform();
    });

    window.addEventListener('mouseup', () => {
      if (this.isDragging) {
        this.isDragging = false;
        this.viewport.style.cursor = 'grab';
      }
    });

    this.viewport.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = 1.1;
      const rect = this.viewport.getBoundingClientRect();
      
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const cx = (mouseX - this.panX) / this.zoom;
      const cy = (mouseY - this.panY) / this.zoom;

      if (e.deltaY < 0) {
        this.zoom = Math.min(this.zoom * zoomFactor, 12);
      } else {
        this.zoom = Math.max(this.zoom / zoomFactor, 0.4);
      }

      this.panX = mouseX - cx * this.zoom;
      this.panY = mouseY - cy * this.zoom;

      this.updateTransform();
    }, { passive: false });
  }

  updateTransform() {
    this.container.style.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.zoom})`;
  }

  resetView() {
    this.zoom = 1;
    this.panX = 0;
    this.panY = 0;
    this.updateTransform();
  }

  zoomIn() {
    this.zoom = Math.min(this.zoom * 1.3, 12);
    this.updateTransform();
  }

  zoomOut() {
    this.zoom = Math.max(this.zoom / 1.3, 0.4);
    this.updateTransform();
  }

  selectStructure(id) {
    if (!this.currentSvg) return;

    this.currentSvg.querySelectorAll('.active').forEach(el => {
      el.classList.remove('active');
    });

    if (id) {
      const el = this.currentSvg.getElementById(id);
      if (el) {
        el.classList.add('active');
        this.panToElement(el);
      }
    }
  }

  panToElement(element) {
    const svgRect = this.currentSvg.getBoundingClientRect();
    const elemRect = element.getBoundingClientRect();
    const viewportRect = this.viewport.getBoundingClientRect();

    const targetX = (viewportRect.width / 2) - (elemRect.left - svgRect.left + elemRect.width / 2) * this.zoom;
    const targetY = (viewportRect.height / 2) - (elemRect.top - svgRect.top + elemRect.height / 2) * this.zoom;

    this.panX = targetX;
    this.panY = targetY;
    this.updateTransform();
  }

  handleMouseEnter(e, el) {
    sound.playHover();
    const id = el.id;
    let data = anatomyData[id];
    
    // Fallback if not directly defined in the core DB
    if (!data) {
      data = this.generateFallbackData(id, el);
    }
    
    if (this.onHover) {
      this.onHover(id, data, e.clientX, e.clientY, true);
    }
  }

  handleMouseLeave(e, el) {
    if (this.onHover) {
      this.onHover(null, null, 0, 0, false);
    }
  }

  handleMouseMove(e) {
    if (this.onHover) {
      this.onHover(null, null, e.clientX, e.clientY, null);
    }
  }

  handleClick(e, el) {
    e.stopPropagation();
    sound.playClick();
    const id = el.id;
    
    this.selectStructure(id);

    if (this.onSelect) {
      this.onSelect(id);
    }
  }

  clearSelection() {
    if (this.currentSvg) {
      this.currentSvg.querySelectorAll('.active').forEach(el => {
        el.classList.remove('active');
      });
    }
  }

  highlightSystemElements(ids) {
    if (!this.currentSvg) return;
    
    this.currentSvg.querySelectorAll('.system-highlight').forEach(el => {
      el.classList.remove('system-highlight');
    });

    if (ids && ids.length > 0) {
      ids.forEach(id => {
        const el = this.currentSvg.getElementById(id);
        if (el) {
          el.classList.add('system-highlight');
        }
      });
    }
  }

  generateFallbackData(id, el) {
    let title = '';
    const titleEl = el.querySelector('title');
    if (titleEl) title = titleEl.textContent;

    const titleLower = title.toLowerCase();
    const fallback = fallbackDict[titleLower] || { zh: title || "未知構造", system: "nervous", desc: "維持人體動態平衡與生理調節的重要解剖構造。" };
    
    return {
      zh: fallback.zh,
      en: title || id,
      system: fallback.system,
      overview: fallback.desc || `此為解剖構造「${fallback.zh}」，在人類解剖學本體論 (Ontology) 中標識為 ${id}。它在維持人體正常的生理運作中佔有不可或缺的位置。`,
      histology: `該結構由特化的細胞與基底組織排列構成，具有極具生理特徵的微觀形態，符合其在生物體內的專屬功能需求。`,
      clinical: `若此區域發生病變，可能會影響人體整體的動態平衡，臨床上常需透過影像學 (如 MRI、CT) 或組織切片進行診斷。`,
      stats: [
        { label: "解剖學標記", value: id }
      ]
    };
  }
}

// ==========================================================================
// 4. Main App Orchestrator (Tabbed Panel, Search, Quiz, System Filter)
// ==========================================================================
class AnatomyApp {
  constructor() {
    this.currentView = 'male';
    this.selectedStructureId = null;
    this.activeTab = 'detail';
    
    this.tooltip = document.getElementById('tooltip');

    this.svgController = new SvgController(
      document.getElementById('viewport'),
      document.getElementById('svg-container'),
      (id) => this.handleStructureSelect(id),
      (id, data, x, y, visible) => this.handleStructureHover(id, data, x, y, visible)
    );

    this.setupGlobalListeners();
    this.loadView(this.currentView);
    this.renderIndexList();
    this.setupSystemFilters();
  }

  setupGlobalListeners() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playClick();
        const tabName = btn.dataset.tab;
        this.switchTab(tabName);
      });
    });

    document.getElementById('btn-zoom-in').addEventListener('click', () => {
      sound.playClick();
      this.svgController.zoomIn();
    });
    document.getElementById('btn-zoom-out').addEventListener('click', () => {
      sound.playClick();
      this.svgController.zoomOut();
    });
    document.getElementById('btn-zoom-reset').addEventListener('click', () => {
      sound.playClick();
      this.svgController.resetView();
    });

    document.querySelectorAll('.view-select-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playClick();
        const view = btn.dataset.view;
        this.loadView(view);
      });
    });

    document.getElementById('search-input').addEventListener('input', (e) => {
      const query = e.target.value.trim();
      this.renderIndexList(query);
    });

    document.getElementById('viewport').addEventListener('click', (e) => {
      if (!e.target.closest('[id^="UBERON_"], [id^="EFO_"], [id^="OTHERS_"]')) {
        this.clearSelection();
      }
    });

    const soundToggle = document.getElementById('sound-toggle');
    if (soundToggle) {
      soundToggle.addEventListener('click', () => {
        const isMuted = sound.toggleMute();
        soundToggle.textContent = isMuted ? '🔇 靜音' : '🔊 音效';
        if (!isMuted) {
          sound.playClick();
        }
      });
    }

    document.getElementById('btn-quiz-find').addEventListener('click', () => {
      sound.playClick();
      this.startQuiz('find');
    });
    document.getElementById('btn-quiz-mcq').addEventListener('click', () => {
      sound.playClick();
      this.startQuiz('mcq');
    });
    document.getElementById('btn-quiz-exit').addEventListener('click', () => {
      sound.playClick();
      this.exitQuiz();
    });
    document.getElementById('btn-quiz-next').addEventListener('click', () => {
      sound.playClick();
      this.nextQuizQuestion();
    });
  }

  switchTab(tabName) {
    this.activeTab = tabName;
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    document.querySelectorAll('.tab-pane').forEach(pane => {
      pane.classList.toggle('active', pane.id === `tab-${tabName}`);
    });
  }

  loadView(viewName) {
    this.currentView = viewName;

    document.querySelectorAll('.view-select-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === viewName);
    });

    const indicatorText = viewName === 'male' ? '人體解剖視圖 (Homo sapiens Male)' : '大腦局部視圖 (Homo sapiens Brain)';
    document.getElementById('view-indicator-txt').textContent = indicatorText;

    const templateId = viewName === 'male' ? 'template-male' : 'template-brain';
    this.svgController.loadSvg(templateId);

    this.clearSelection();
    this.renderIndexList();

    this.activeSystem = null;
    document.querySelectorAll('.system-btn').forEach(btn => btn.classList.remove('active'));
    
    this.exitQuiz();
  }

  handleStructureSelect(id) {
    this.selectedStructureId = id;
    
    // Check local database or fallback
    let data = anatomyData[id];
    if (!data && this.svgController.currentSvg) {
      const el = this.svgController.currentSvg.getElementById(id);
      if (el) {
        data = this.svgController.generateFallbackData(id, el);
      }
    }

    if (this.quizActive && this.quizMode === 'find') {
      this.handleQuizAnswerFind(id);
      return;
    }

    this.switchTab('detail');
    this.renderDetailPanel(id, data);
  }

  handleStructureHover(id, data, x, y, visible) {
    if (visible === false) {
      this.tooltip.classList.remove('visible');
      return;
    }

    if (x && y) {
      this.tooltip.style.left = `${x + 15}px`;
      this.tooltip.style.top = `${y + 15}px`;
    }

    if (id && data) {
      document.getElementById('tooltip-zh').textContent = data.zh;
      document.getElementById('tooltip-en').textContent = data.en;
      document.getElementById('tooltip-uberon').textContent = id;
      this.tooltip.classList.add('visible');
    }
  }

  clearSelection() {
    this.selectedStructureId = null;
    this.svgController.clearSelection();
    this.renderDetailPanel(null, null);
  }

  renderDetailPanel(id, data) {
    const emptyPanel = document.getElementById('detail-empty');
    const contentPanel = document.getElementById('detail-content');

    if (!id || !data) {
      emptyPanel.style.display = 'flex';
      contentPanel.style.display = 'none';
      return;
    }

    emptyPanel.style.display = 'none';
    contentPanel.style.display = 'block';

    document.getElementById('detail-uberon').textContent = id;
    document.getElementById('detail-title-zh').textContent = data.zh;
    document.getElementById('detail-title-en').textContent = data.en;
    document.getElementById('detail-overview').textContent = data.overview;
    document.getElementById('detail-histology').textContent = data.histology;
    document.getElementById('detail-clinical').textContent = data.clinical;

    const sysTag = document.getElementById('detail-system');
    const sys = SYSTEM_INFO[data.system];
    sysTag.textContent = sys ? sys.name : '未知系統';
    sysTag.style.backgroundColor = sys ? sys.color : 'var(--color-text-secondary)';

    const statsGrid = document.getElementById('detail-stats');
    statsGrid.innerHTML = '';
    if (data.stats && data.stats.length > 0) {
      data.stats.forEach(stat => {
        const card = document.createElement('div');
        card.className = 'stats-card';
        card.innerHTML = `
          <div class="stats-label">${stat.label}</div>
          <div class="stats-value">${stat.value}</div>
        `;
        statsGrid.appendChild(card);
      });
    }
  }

  setupSystemFilters() {
    const grid = document.getElementById('system-filters');
    grid.innerHTML = '';
    
    this.activeSystem = null;

    Object.entries(SYSTEM_INFO).forEach(([sysKey, sysVal]) => {
      const btn = document.createElement('button');
      btn.className = 'system-btn';
      btn.style.setProperty('--dot-color', sysVal.color);
      btn.style.setProperty('--bg-rgb', sysVal.rgb);
      btn.innerHTML = `
        <div class="system-color-dot"></div>
        <span>${sysVal.name}</span>
      `;
      
      btn.addEventListener('click', () => {
        sound.playClick();
        if (this.activeSystem === sysKey) {
          this.activeSystem = null;
          btn.classList.remove('active');
          this.svgController.highlightSystemElements([]);
        } else {
          document.querySelectorAll('.system-btn').forEach(b => b.classList.remove('active'));
          this.activeSystem = sysKey;
          btn.classList.add('active');
          
          const matchingIds = Object.keys(anatomyData)
            .filter(id => anatomyData[id].system === sysKey && this.isIdInCurrentView(id));
            
          // Also check fallback dict for matches
          const fallbackMatches = Object.entries(fallbackDict)
            .filter(([k, v]) => v.system === sysKey)
            .map(([k, v]) => k);
          
          if (this.svgController.currentSvg) {
            const svgElements = this.svgController.currentSvg.querySelectorAll('[id^="UBERON_"], [id^="EFO_"]');
            svgElements.forEach(el => {
              const titleEl = el.querySelector('title');
              const titleText = titleEl ? titleEl.textContent.toLowerCase() : '';
              if (matchingIds.includes(el.id) || fallbackMatches.includes(titleText)) {
                matchingIds.push(el.id);
              }
            });
          }
          
          this.svgController.highlightSystemElements(Array.from(new Set(matchingIds)));
        }
      });

      grid.appendChild(btn);
    });
  }

  isIdInCurrentView(id) {
    const isBrainId = id.startsWith('UBERON_') && [
      'UBERON_0000955', 'UBERON_0000956', 'UBERON_0001870', 'UBERON_0001871',
      'UBERON_0001872', 'UBERON_0002021', 'UBERON_0002037', 'UBERON_0001954',
      'UBERON_0001876', 'UBERON_0001897', 'UBERON_0001898', 'UBERON_0001896',
      'UBERON_0002038', 'UBERON_0002148', 'UBERON_0002360', 'UBERON_0002285',
      'UBERON_0002421', 'UBERON_0002771', 'UBERON_0002702', 'UBERON_0001905',
      'UBERON_0001873', 'UBERON_0001874', 'UBERON_0001875', 'UBERON_0001882',
      'UBERON_0003027'
    ].includes(id);

    if (this.currentView === 'brain') {
      return isBrainId;
    } else {
      return !isBrainId || id === 'UBERON_0000955' || id === 'UBERON_0000956' || id === 'UBERON_0002037' || id === 'UBERON_0002421';
    }
  }

  renderIndexList(query = '') {
    const list = document.getElementById('index-list');
    list.innerHTML = '';

    const lowercaseQuery = query.toLowerCase();

    // Collect all active structures in current view from both database and actual SVG tags
    const activeItems = new Map();
    
    // First pull from defined database
    Object.entries(anatomyData).forEach(([id, data]) => {
      if (this.isIdInCurrentView(id)) {
        activeItems.set(id, { zh: data.zh, en: data.en, system: data.system });
      }
    });

    // Then pull from actual SVG elements for full coverage
    if (this.svgController.currentSvg) {
      const svgElements = this.svgController.currentSvg.querySelectorAll('[id^="UBERON_"], [id^="EFO_"]');
      svgElements.forEach(el => {
        const id = el.id;
        if (!activeItems.has(id) && this.isIdInCurrentView(id)) {
          const titleEl = el.querySelector('title');
          const title = titleEl ? titleEl.textContent : '';
          const fallback = fallbackDict[title.toLowerCase()] || { zh: title || id, system: 'nervous' };
          activeItems.set(id, { zh: fallback.zh, en: title || id, system: fallback.system });
        }
      });
    }

    const filteredEntries = Array.from(activeItems.entries())
      .filter(([id, data]) => {
        if (query) {
          const matchZh = data.zh.includes(query);
          const matchEn = data.en.toLowerCase().includes(lowercaseQuery);
          const matchUberon = id.toLowerCase().includes(lowercaseQuery);
          return matchZh || matchEn || matchUberon;
        }
        return true;
      });

    if (filteredEntries.length === 0) {
      list.innerHTML = `<li style="padding:16px;text-align:center;color:var(--color-text-secondary);font-size:0.9rem;">無相符的解剖構造</li>`;
      return;
    }

    filteredEntries.forEach(([id, data]) => {
      const li = document.createElement('li');
      li.className = `index-item ${this.selectedStructureId === id ? 'active' : ''}`;
      
      const sysName = SYSTEM_INFO[data.system]?.name || '未知';
      li.innerHTML = `
        <div class="index-item-text">
          <span class="index-item-zh">${data.zh}</span>
          <span class="index-item-en">${data.en}</span>
        </div>
        <span class="index-item-system">${sysName}</span>
      `;

      li.addEventListener('click', () => {
        sound.playClick();
        this.handleStructureSelect(id);
        this.svgController.selectStructure(id);
      });

      list.appendChild(li);
    });
  }

  // ==========================================================================
  // 5. Quiz Controller (Learning Mode)
  // ==========================================================================
  startQuiz(mode) {
    this.quizActive = true;
    this.quizMode = mode;
    this.quizScore = 0;
    this.quizTotal = 0;

    document.getElementById('quiz-setup').style.display = 'none';
    
    const panel = document.getElementById('quiz-active-panel');
    panel.classList.add('active');

    const modeName = mode === 'find' ? '搜尋挑戰 (點選圖片中器官)' : '醫學常識多選問答';
    document.getElementById('quiz-mode-name').textContent = modeName;
    this.updateScoreBoard();

    document.getElementById('btn-quiz-next').style.display = 'none';

    this.nextQuizQuestion();
  }

  exitQuiz() {
    this.quizActive = false;
    document.getElementById('quiz-setup').style.display = 'flex';
    document.getElementById('quiz-active-panel').classList.remove('active');
    document.getElementById('quiz-options').innerHTML = '';
    document.getElementById('quiz-feedback').textContent = '';
    
    if (this.currentQuestionId) {
      const el = document.getElementById(this.currentQuestionId);
      if (el) el.classList.remove('pulse-highlight');
    }
    
    this.svgController.clearSelection();
  }

  updateScoreBoard() {
    document.getElementById('quiz-score').textContent = `得分: ${this.quizScore} / ${this.quizTotal}`;
  }

  nextQuizQuestion() {
    this.quizTotal++;
    this.updateScoreBoard();

    document.getElementById('quiz-feedback').textContent = '';
    document.getElementById('quiz-feedback').style.color = '';
    document.getElementById('btn-quiz-next').style.display = 'none';
    this.svgController.clearSelection();

    // Find candidates which are available on the current SVG viewport
    const candidates = [];
    if (this.svgController.currentSvg) {
      const svgElements = this.svgController.currentSvg.querySelectorAll('[id^="UBERON_"], [id^="EFO_"]');
      svgElements.forEach(el => {
        if (this.isIdInCurrentView(el.id)) {
          candidates.push(el.id);
        }
      });
    }

    if (candidates.length === 0) {
      alert('當前視角沒有可用的測驗結構');
      this.exitQuiz();
      return;
    }

    const randomId = candidates[Math.floor(Math.random() * candidates.length)];
    this.currentQuestionId = randomId;
    
    // Resolve structure data
    let targetData = anatomyData[randomId];
    if (!targetData && this.svgController.currentSvg) {
      const el = this.svgController.currentSvg.getElementById(randomId);
      if (el) {
        targetData = this.svgController.generateFallbackData(randomId, el);
      }
    }

    const questionTextEl = document.getElementById('quiz-question-text');
    const optionsContainer = document.getElementById('quiz-options');
    optionsContainer.innerHTML = '';

    if (this.quizMode === 'find') {
      questionTextEl.innerHTML = `請在圖中尋找：<br><strong style="color:var(--color-accent);">${targetData.zh} (${targetData.en})</strong>`;
      optionsContainer.innerHTML = `<div style="text-align:center;color:var(--color-text-secondary);font-size:0.85rem;padding:20px;font-style:italic;">請直接在左側解剖圖上點擊該器官的位置...</div>`;
      this.answered = false;
    } else {
      questionTextEl.innerHTML = `突顯器官的生理功能為？`;
      
      this.svgController.selectStructure(randomId);
      const elem = this.svgController.currentSvg.getElementById(randomId);
      if (elem) {
        elem.classList.add('pulse-highlight');
      }

      // Collect 3 wrong choices
      const wrongCandidates = Object.values(anatomyData).map(d => d.overview);
      Object.values(fallbackDict).forEach(d => {
        if (d.desc) wrongCandidates.push(d.desc);
      });
      
      const shuffledOverviews = Array.from(new Set(wrongCandidates))
        .filter(desc => desc !== targetData.overview)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
        
      const choices = [
        { text: targetData.overview, correct: true },
        ...shuffledOverviews.map(desc => ({ text: desc, correct: false }))
      ].sort(() => 0.5 - Math.random());

      choices.forEach(choice => {
        const btn = document.createElement('button');
        btn.className = 'quiz-option-btn';
        btn.textContent = this.truncateText(choice.text, 80);
        btn.addEventListener('click', () => this.handleQuizAnswerMCQ(btn, choice.correct));
        optionsContainer.appendChild(btn);
      });
      this.answered = false;
    }
  }

  truncateText(str, n) {
    return (str.length > n) ? str.substr(0, n-1) + '...' : str;
  }

  handleQuizAnswerFind(clickedId) {
    if (this.answered) return;
    this.answered = true;

    const targetId = this.currentQuestionId;
    
    let targetData = anatomyData[targetId];
    if (!targetData && this.svgController.currentSvg) {
      const el = this.svgController.currentSvg.getElementById(targetId);
      targetData = this.svgController.generateFallbackData(targetId, el);
    }
    
    const feedbackEl = document.getElementById('quiz-feedback');

    if (clickedId === targetId) {
      sound.playSuccess();
      feedbackEl.textContent = '🎉 正確！完美找出結構位置。';
      feedbackEl.style.color = 'var(--sys-lymphatic)';
      this.quizScore++;
    } else {
      sound.playFailure();
      this.svgController.selectStructure(targetId);
      
      let clickedData = '其他區域';
      if (anatomyData[clickedId]) {
        clickedData = anatomyData[clickedId].zh;
      } else if (this.svgController.currentSvg) {
        const el = this.svgController.currentSvg.getElementById(clickedId);
        if (el) {
          clickedData = this.svgController.generateFallbackData(clickedId, el).zh;
        }
      }
      feedbackEl.innerHTML = `❌ 錯誤。你點選了「${clickedData}」，正確應為 <span style="border-bottom: 2px solid var(--color-accent);">${targetData.zh}</span>。`;
      feedbackEl.style.color = 'var(--color-accent)';
    }

    this.updateScoreBoard();
    document.getElementById('btn-quiz-next').style.display = 'block';
  }

  handleQuizAnswerMCQ(selectedBtn, isCorrect) {
    if (this.answered) return;
    this.answered = true;

    const feedbackEl = document.getElementById('quiz-feedback');
    const optionsContainer = document.getElementById('quiz-options');

    const elem = this.svgController.currentSvg.getElementById(this.currentQuestionId);
    if (elem) {
      elem.classList.remove('pulse-highlight');
    }

    let targetData = anatomyData[this.currentQuestionId];
    if (!targetData && this.svgController.currentSvg) {
      const el = this.svgController.currentSvg.getElementById(this.currentQuestionId);
      targetData = this.svgController.generateFallbackData(this.currentQuestionId, el);
    }

    if (isCorrect) {
      sound.playSuccess();
      selectedBtn.classList.add('correct');
      feedbackEl.textContent = '🎉 回答正確！';
      feedbackEl.style.color = 'var(--sys-lymphatic)';
      this.quizScore++;
    } else {
      sound.playFailure();
      selectedBtn.classList.add('wrong');
      feedbackEl.textContent = '❌ 回答錯誤。';
      feedbackEl.style.color = 'var(--color-accent)';
      
      Array.from(optionsContainer.children).forEach(btn => {
        const fullOverview = targetData.overview;
        if (fullOverview.includes(btn.textContent.replace('...', ''))) {
          btn.classList.add('correct');
        }
      });
    }

    this.updateScoreBoard();
    document.getElementById('btn-quiz-next').style.display = 'block';
  }
}

// ==========================================================================
// Initialization
// ==========================================================================
window.addEventListener('DOMContentLoaded', () => {
  window.app = new AnatomyApp();
});
