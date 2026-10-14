---
title: "Aligning AI to International Agreements? Why and How?"
subtitle: "Our new paper on the value and pitfalls of 'Treaty-Following' AI"
date: "2025-12-19T12:19:33.461Z"
substack_url: "https://criticalmaas.substack.com/p/aligning-ai-to-international-agreements"
---
Back in July, writing a day before my birthday, I excitedly announced that this blog was ‘[going critical’](/essays/going-critical/), and would soon be overflowing with blog posts. The reality—amid, er, two book projects and a new baby—is that I mostly just managed to keep up with some monthly link roundups. That won't do.

There is that fun moment near the end of each year, though, where it becomes clear what writing projects you'll manage to finish, and which you won't. I'm not surprised to find that this year the latter list is again quite long, for both research projects and draft blog posts.{{< sidenote >}}I may not have published many *actual* posts this year; but at least I have nearly a dozen 70% finished ones. That has to count for something?{{< /sidenote >}}

There is one piece however that I did finish, and, fortunately, it's about one of the most surprisingly layered ideas to [nerd-snipe](https://www.explainxkcd.com/wiki/index.php/356:_Nerd_Sniping) me this year: **could AI agents follow (i.e. autonomously comply with) international treaties? What would be the point of that?**

TLDR: the answer, as Tobi Olasunkanmi and I explore in our new paper on ***Treaty-Following AI***' (get your own now, in the flavours [HTML](https://law-ai.org/treaty-following-ai/), [PDF](https://law-ai.org/wp-content/uploads/2025/12/Maas-Olasunkanmi-2025-Treaty-Following-AI-final-LawAI-WPS-1-2025-4.pdf), [SSRN](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5867502)), is…

1.  plausibly, yes\![ˆ*IMPRESSIVELY BIG ASTERISK*\] and;

2.  this could be tremendously useful, whether from the perspective of (frontier AI) states or international lawyers; since a system to robustly align AI agents to treaty texts would serve as a tremendous commitment and compliance mechanism for governments, potentially reinvigorating the role of treaties in international law.

So: we propose a legal, technical, and political program to explore the prospects—and pave the way—for ‘Treaty-Following AI’.

<figure>
<img src="https://substackcdn.com/image/fetch/w_1200,c_limit,f_auto,q_auto:good/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe5a10c50-89de-4b7a-a70a-5ca55116bf30_1456x816.webp" alt="" loading="lazy">
</figure>

*Fig. π : As seen in this schematic, ‘Treaty-Following AI’ involves, for starters, the construction of a chip-shaped megastructure in low-Earth orbit*

When we first dove into on this project, I expected it to just be fodder for a short blog post. Instead, it took us down a rabbit hole as we quickly found the answer to be startlingly complex, in legal, technical, and political terms—even by the standards of what I think is an already [very rich open field](https://www.lawfaremedia.org/article/open-questions-in-law-and-ai-safety-an-emerging-research-agenda) at the intersection of AI, international relations, and legal theory.

*Wait, what, AI agents? Laws? Where is this all coming from?* Let's back up for a moment.

## Align-It-Yourself AI: from value- to culture- to personal AI-alignment

In addition to debates over how to govern the developers and development of AI systems (and debates over whether that's better done through *ex ante* regulation or *ex post* mechanisms such as liability or tort law), there is a long-running strand of thought that considers whether, or how, AI systems (or, in some lines of work, insert ‘robots’) could be made directly beholden to particular normative commands or values.

Well, we're now maybe a decade into the debates around AI alignment,{{< sidenote >}}I forget the precise timeline. I recall seeing Paul Christiano [operationalize it](https://ai-alignment.com/clarifying-ai-alignment-cec47cd69dd6) around [2018](https://ai-alignment.com/clarifying-ai-alignment-cec47cd69dd6), but also seeing the term around earlier, maybe by Stuart Russell? Of course, the early concept arguably developed out of earlier AI safety ideas around ‘Friendly AI’, ‘Value Loading’, or ‘[Coherent Extrapolated Volition](https://www.lesswrong.com/w/coherent-extrapolated-volition)’; however, it could also be possible to instead trace it back to much earlier or preceding concepts or concerns around value specification or the risks that machines might be configured to erode human welfare (e.g. Norbert Weiner's 1950 *[The Human Use of Human Beings](https://monoskop.org/images/9/90/Wiener_Norbert_The_Human_Use_of_Human_Beings_1950.pdf)*).{{< /sidenote >}} and people are clearly still having fun with it. A lot of this has focused on what would be the appropriate ‘value alignment targets’ for advanced AI systems (e.g. see Iason Gabriel's great [overview](https://link.springer.com/article/10.1007/s11023-020-09539-2) from some years back).

A lot of the early work on this focused on ‘universal alignment’—i.e. abstract principles taken to apply to all humans everywhere. Debates at this level focus mostly on whether such values could or should be derived top-town, or arrived at through a bottom-up (but global) [social choice process](https://link.springer.com/article/10.1007/s00146-017-0760-1) (spoiler alert; neither is ideal or easy).

However, in the past few years, debates have turned also to consider AI alignment targets that are normative sets that are locally or regionally sensitive and that could accommodate pluralism and decentralization. Nonetheless, these aren't without risks either. E.g. Harry Law has explored some of the [challenges inherent in the recent emphasis on ‘cultural alignment'](https://www.learningfromexamples.com/p/against-cultural-alignment?hide_intro_popup=true), such as exclusion, paternalism, unrestrained reinforcement of certain cultural norms, and stasis. He argues that

> Cultural alignment is neither fine-grained enough to honour individual diversity, nor principled enough to serve as a moral foundation. It treats cultural averages as moral ideals, sidelining anyone who deviates from the script despite its best intentions. A better bet is to accept that people know themselves best *and* that some things are wrong no matter where you are.
>
> That’s why my preferred approach looks like (a) a universal floor that guards against clear manifestations of bad behaviour, paired with (b) deep personalisation that gives everyone a model that acts in accordance with their values.

I think I’m also generally eager for personalization, but the question still remains—what then should be such an ‘universal floor’? Also, is it possible to still maintain some modest local floors that define—and delimit—prohibited behaviours in particular contexts and societies? And how could that be legitimate?

## Just make it… follow the law

A surprisingly straight-forward and sensible compromise response to this question is: don't overthink this, just align AI agents to (democratically produced) law.

Now, the idea of using legal principles as alignment targets isn't new per se;{{< sidenote >}}For instance, amongst early cyberlaw and robolaw work, take, for instance, [this proposal](https://dl.acm.org/doi/10.24963/ijcai.2024/946) by Ondrej Bajgar and Jan Horenovsky, to use ‘negative human rights’ as anchor for the actions of advanced AI systems.{{< /sidenote >}} but it was given some really new impetus earlier this year in a cool paper by [Cullen O’Keefe](https://juralnetworks.substack.com/), [Janna Tay](https://substack.com/@janna), Christoph Winter{{< sidenote >}}Disclaimer: CoK, JT, and CW are my colleagues—but they're independently amazing, and I would have{{< /sidenote >}} and Ketan Ramakrishnan. In ‘[Law-Following AI](https://law-ai.org/law-following-ai/): designing AI agents to obey human laws’,{{< sidenote >}}See also this accessible [LawFare essay](https://www.lawfaremedia.org/article/ai-agents-must-follow-the-law) if 73-page law review articles are not your fare (*why not? As the author of a [600-page book](https://doi.org/10.1093/9780191988455.001.0001) I feel personally attacked*).{{< /sidenote >}} they argue in favour of the idea of Law-Following AI (LFAI) as a research program that pursues:

> “AI agents \[…\] designed to rigorously comply with a broad set of legal requirements, at least in some deployment settings. These AI agents would be loyal to their principals, but refuse to take actions that violate applicable legal duties.”¹¹⁴

Their paper both explored and addressed many of the legal and technical questions raised by this idea; but it also sketched a research agenda for future legal questions that this opens up.

The idea of LFAI has been developed further in a wonderful [workshop](https://juralnetworks.substack.com/p/law-following-ai-new-paper-and-workshop), and has of course many directions to go into. For instance, Cullen has [explored the ‘Law-Grounding’ problem](https://juralnetworks.substack.com/p/why-give-ai-agents-actual-legal-duties) for law-following AI, arguing in favour of imposing actual legal duties on AI agents. For our part, Tobi and I were excited to take this idea in a different direction, exploring the extension of law-following AI to the international law level…

## … to AI that follows treaties?

…which turns out to be complex since, no surprise international law is kind of tricky and unusual in many respects.

<figure>
<img src="https://substackcdn.com/image/fetch/w_1200,c_limit,f_auto,q_auto:good/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fde61cfc5-b57d-4a14-b42d-1ab0f86ac9dc_1382x1536.jpeg" alt="text, letter" loading="lazy">
</figure>

*Fig δ: since I'm pressed for time to get this out before Christmas, this is my way to just get you to read the abstract*

After all, how would Treaty-Following AI agents work—technically, politically, and legally—under international law? Could they help credibly strengthen deploying states’ compliance with their international obligations? What would this mean for the prospects of a new generation of self-executing treaties, and for the future of the international legal system? Exploring the idea, we found, also raises interesting questions about the nature, the mechanisms, and the ontological assumptions (e.g. what entities can count as legal actors) of the international legal system.

In response, in the paper, we:

-   Explore the value and role of a Treaty-following AI (and AI-guiding treaty) system to resolving states commitment and cooperation problems, especially around the actions taken by the advanced AI systems they deploy.

-   Chart trends and developments in AI’s agentic and legal-reasoning capabilities, to explore the technical feasibility of such systems, as well as the outstanding hurdles and open questions to realizing this mechanism.

-   Consider potential innovations in treaty design that would be enabled by coupling it to TFAI agents

-   Discuss the legal relationship between treaty-following AI agents and their deploying states under the existing international law of state responsibility (codified in the Articles on Responsibility of States for Internationally Wrongful Acts)

-   Consider how treaty-following AI agents might apply the methods of interpretation under the Vienna Convention on the Law of Treaties (VCLT)

-   Set out future areas of research, such as on treaty-alignment verification, the operation of treaty-alignment in ‘[orchestrated](https://epochai.substack.com/p/why-future-ai-agents-will-be-trained)’ multi-agent set-ups, or the longer-term political implications of adopting this framework.

This, alongside lengthy, lengthy digressions on whether unfaithful chain-of-thought-reasoning erodes the prospects for trustable TFAI agents; what evidence we even have (from biology, from behaviour, and from mechanistic interpretability) for assuming that AI systems are capable of undertaking human-*like* legal reasoning (and whether this matters if they robustly reach the same legal conclusions); the opportunities for using ‘LLM Grooming’ attacks to corrupt the interpretative methods used by TFAI agents under the Vienna Convention, etc. etc.

This is not the last word on this, and we’re already working on many interesting and fun extensions of this idea (for instance; could states use a TFAI framework to enshrine extremely strong, nearly-irreversible commitments that they, or future administrations, would find it legally impossible to unilaterally withdraw from? Surprisingly, this seems legally possible under the VCLT, though it'd obviously be hugely politically fraught, and have many potential drawbacks).

Anyway, we'd love for you to read it (Just read it over the Holidays! Your family will understand…), and we'd greatly welcome thoughts and feedback on the system and mechanisms.

------------------------------------------------------------------------

Once again, **you can find the paper here ([HTML](https://law-ai.org/treaty-following-ai/), [PDF](https://law-ai.org/wp-content/uploads/2025/12/Maas-Olasunkanmi-2025-Treaty-Following-AI-final-LawAI-WPS-1-2025-4.pdf), [SSRN](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5867502)).**

*Some credits and acknowledgements to the many people who gave feedback on the paper and the idea: Cullen O’Keefe, Janna Tay, Andrew Mazibrada, Charlie Bullock, Lara Thurnherr, Talita Dias, Iason Gabriel, Bart Kubiak, Shahar Avin, Sunayana Rane, Nicholas Felstead, Charlotte Stix, Mauricio Baker, Connor Dunlop, Benjamin Hodgkiss, Oliver Guest, Thomas Burri, Rebecca Crootof, and Jacob Livingston Slosser, as well as the participants ofthe August 2025 Cambridge Workshop on Law-Following AI.*
