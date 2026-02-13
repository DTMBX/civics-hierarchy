import { useState, useEffect } from 'react'
import { SavedCitation, Document, Section } from '@/lib/types'
import { TagDefinition } from '@/components/tag-manager'
import {
  DialogC
  DialogHeader,
  DialogFooter,
import { Button
import { Switc
import { Badge 
import { ScrollArea } from '@/c
import { Checkbox } from '@/components/ui/check
  Brain, 
  XCircle, 
  Sparkle, 
  Pause,
  ArrowRight,
  Tag
import { toast } from 'sonner'
interface BatchDeepAnalysisDialogProps {
import { 
  Brain, 
  CheckCircle, 
  XCircle, 
  Warning, 
  Sparkle, 
  Play,
  Pause,
  Stop,
  ArrowRight,
  DownloadSimple,
  Tag
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface BatchDeepAnalysisDialogProps {
  open: boolean
  onClose: () => void
  citations: SavedCitation[]
  documents: Document[]

  suggestedTags: string[]
  practiceAreas: string[]
}

  open,
  citations,
  sections,
  onApplyTags,
  const [selectedCitations, setSelected
  const [isRunning,
  const [currentIndex, se
  const [skipAlreadyTagge
  const [showResults, setShowRes
  useEffect(() =
      setSelectedCitation
}

    }

  const totalSelected = s
    r.status === 'complet
  const progress = totalSelected
  const analyzeSing
 

          citationId: citation.id,
       
          
          pr
  documents,
      }
  allTags,

        return {
          status: 'failed',
          confidence: 'low',
          legalConcepts: [],
          constitutionalIssues: [],
          processingTime: Date.now() - startTime,
      }
      const contentToAnalyze = [
        `Citation: ${citation.canonicalCitation
        section?.title ? `Section: ${section.title}` : 

      ].filter(Bool
      const tag
        .join('\n')
      const promptText = `You are a
CITATION CONTENT TO ANAL
      setIsRunning(false)
${tagList}
CURRENT TAGS: ${citation.ta
ANALY
  }, [open, citations])

6. Assign a confidence level based on how well the content matches the suggested t
Return your analysis as a JSON object with this exac
  "suggestedTags": ["Tag Name 1", "Tag Name 2", "Tag Name 3"],
  "practiceAreas": ["area1", "area2"],
  ).length


      const newTags = llmResult.suggestedTags.filter(tag => 
      )
    
    try {
          ? 'medium'
        return {
        citationId: citation.id,
        suggestedTags: newTa
          suggestedTags: [],
          confidence: 'low',
          reasoning: 'Citation already has sufficient tags',
          legalConcepts: [],
          practiceAreas: [],
          constitutionalIssues: [],
          processingTime: Date.now() - startTime,
        }
       

      const section = sections.find(s => s.id === citation.sectionId)
      const document = documents.find(d => d.id === citation.documentId)

      if (!section && !document) {
        return {
          citationId: citation.id,
          status: 'failed',
          suggestedTags: [],
          confidence: 'low',
          reasoning: '',
          legalConcepts: [],
          practiceAreas: [],
          constitutionalIssues: [],
          error: 'Section or document not found',
          processingTime: Date.now() - startTime,
        }
      }

      const contentToAnalyze = [
        `Title: ${citation.title}`,
        `Citation: ${citation.canonicalCitation}`,
        citation.notes ? `Notes: ${citation.notes}` : '',
        section?.title ? `Section: ${section.title}` : '',
        section?.text ? `Text: ${section.text.substring(0, 1000)}` : '',
        document?.title ? `Document: ${document.title}` : '',
        document?.description ? `Description: ${document.description}` : '',
      ].filter(Boolean).join('\n')

      const tagList = allTags
        .map(t => `- ${t.name} (${t.category}): ${t.description}`)
        .join('\n')

      const prompt = spark.llmPrompt`You are a legal research assistant analyzing a citation from a law reference application. Your task is to suggest the most relevant tags from the available tag list.

CITATION CONTENT TO ANALYZE:
${contentToAnalyze}

AVAILABLE TAGS:
${tagList}

CURRENT TAGS: ${citation.tags.join(', ') || 'None'}

ANALYSIS INSTRUCTIONS:
1. Identify the key legal concepts, constitutional provisions, and practice areas mentioned
2. Suggest 3-8 most relevant tags from the available tag list that are NOT already applied
3. Focus on tags that would be most useful for legal research and case organization
4. Consider both explicit mentions and implicit legal themes
5. Prioritize accuracy and relevance over quantity
6. Assign a confidence level based on how well the content matches the suggested tags

Return your analysis as a JSON object with this exact structure:
{
  "suggestedTags": ["Tag Name 1", "Tag Name 2", "Tag Name 3"],
  "legalConcepts": ["concept1", "concept2"],
  "practiceAreas": ["area1", "area2"],
  "constitutionalIssues": ["issue1", "issue2"],
  "reasoning": "Brief explanation of why these tags are relevant"
}`

      const response = await window.spark.llm(prompt, 'gpt-4o-mini', true)
      const llmResult = JSON.parse(response) as LLMAnalysisResult

      const newTags = llmResult.suggestedTags.filter(tag => 
        !citation.tags.includes(tag) && allTags.some(t => t.name === tag)
      )

      const confidence: 'high' | 'medium' | 'low' = 
        newTags.length >= 4 && (llmResult.legalConcepts.length > 2 || llmResult.constitutionalIssues.length > 0)
          ? 'high'
          : newTags.length >= 2
          ? 'medium'
          : 'low'

      return {
        citationId: citation.id,
        status: 'completed',
        suggestedTags: newTags,
        confidence,
        reasoning: llmResult.reasoning,
        legalConcepts: llmResult.legalConcepts,
        practiceAreas: llmResult.practiceAreas,
        constitutionalIssues: llmResult.constitutionalIssues,
        processingTime: Date.now() - startTime,
      }
    } catch (error) {
      return {
        citationId: citation.id,
        status: 'failed',
        suggestedTags: [],
        confidence: 'low',
        reasoning: '',
        legalConcepts: [],
        practiceAreas: [],
        constitutionalIssues: [],
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime: Date.now() - startTime,
      }
    }
  }

  const runBatchAnalysis = async () => {
                  <Car
    setShowResults(false)
    
    const citationsToAnalyze = selectedCitationsList.slice(currentIndex)
    
    for (let i = 0; i < citationsToAnalyze.length; i++) {
              </div>
        setCurrentIndex(currentIndex + i)
             
      }

      const citation = citationsToAnalyze[i]
      
      setAnalysisResults(prev => {
        const newMap = new Map(prev)
        newMap.set(citation.id, {
          citationId: citation.id,
                    </div>
                    <Progres
                    <div cla
                        
                          Pa
                      ) : (
                          <Play cla
          
                     
        

                </Card>
      
                    <div className
                    </div>
                    <div className="gri
                     
        

                        <Switch
                          checked={autoApplyHighConfidence}
                        />


                          <p className="text-xs text-muted-foreground">
                          </p>
       
     

                    

                    <div c
                      <div className="flex gap-2"
                          Select All
        
     
   

                        {cita
                          const isSelec
                          return (
            
     
                      
   

                             
                     
                       
   

                              
                      
                      
   

                      </div>
                  </div
              )}
          ) : (
   

                  </CardHeader>
                    <div className
                </Card>
                <Card>
                    <CardTitle cl
              
                  </CardHeader
       
                </C
      
   

                  </CardHeader>
                    <div className="text-2xl font-bold">{st
   

                    <CardTitle clas
                      Skipped
   

                </Card>
                <Card>
                    <CardTitle className="text-sm flex items-
                      Failed
                  </CardHeader>
                    <div className="te
                </Card>

   


                      switch (result.status) {
                          return <CheckCircle className
              
                          return <
                          return <Sparkle className="w-
                    }
                    return (
                        <CardHeader cl
                            {getStat
                              <CardTitle cla
                              </CardTitle>
                                {citation.canonicalCitatio
                            </div>
       
      

                        
                        </CardHeader>
                          {result.status ==
                              <div c
              
     

                                        variant="outline"
                                         
                                        }
                
                                    )
                                

                                
                            

                              {(result.legalCo
   

                 
                         
                                      <span className="font-medium">Practice Areas: </span>
                                    </div>
                                  {result.constitutionalIssues.length > 0 && (
                                      <span className="font-medium">Constitutional: </span>
                                    </div>
                                </di

   

          
                              </Button>
                          )}
                      
                          )}
                          {result.status === 'failed' && (
                          )}
                      </
                  })}
              </ScrollArea>
          )}


          {!showResults ? (
              {!isRunning &
              
                  </Button>
                    <P
                  </Button>
              )}
          ) : (
                  <CardContent>
                Export Results
              <Button onClick={onClose}>
              </Button>
          )}
                  </CardContent>
  )





                  <CardContent>




                  </CardContent>






                  <CardContent>



































































                        </div>























                  <div className="space-y-2">









                      </div>







                          







                              <Checkbox



























                </>

            </>

















                    </CardTitle>

                  <CardContent>

                  </CardContent>







                    </CardTitle>

                  <CardContent>





































                        case 'completed':

                        case 'failed':

                        case 'skipped':

                        default:

                      }



                      <Card key={citationId}>









                              </CardDescription>

                            {result.confidence && (



                              >

                              </Badge>





                            <>





                                    return (

                                        key={tag}











                              </div>











                                    <div>



                                  )}















                              <Button















                            <p className="text-xs text-destructive">{result.error}</p>

                        </CardContent>

                    )

                </div>







        <DialogFooter className="flex-row gap-2 sm:gap-2">

            <>

                <>

                    Cancel





                </>

            </>

            <>



              </Button>



            </>

        </DialogFooter>

    </Dialog>

}
