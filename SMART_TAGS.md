# Smart Tag Suggestions

## Overview

The Smart Tag Suggestions feature provides AI-powered tag recommendations based on citation content, document type, and authority level. This helps users quickly and accurately organize their citation library with minimal manual effort.

## How It Works

### Content Analysis
The system analyzes multiple data points to generate intelligent suggestions:
- **Citation title and canonical citation**
- **Section title and full text**
- **Document title and description**
- **Notes added by the user**
- **Document type** (constitution, statute, regulation, treaty, ordinance)
- **Authority level** (federal, state, territory, local)

### Keyword Matching
The system uses sophisticated keyword dictionaries to identify relevant tags:

#### Constitutional Provisions
Matches content against keywords for:
- Commerce Clause
- Due Process
- Equal Protection
- First Amendment
- Supremacy Clause
- Tenth Amendment
- Necessary and Proper Clause
- Fourth Amendment
- Fifth Amendment
- Fourteenth Amendment

#### Legal Topics
Identifies references to:
- Federalism
- Preemption
- Separation of Powers
- Statutory Interpretation
- Administrative Law
- Civil Rights
- Criminal Law
- Constitutional Law

#### Practice Areas
Detects mentions of:
- Immigration
- Environmental Law
- Employment Law
- Education Law
- Healthcare Law
- Housing Law

#### Case Types
Recognizes patterns for:
- Constitutional Challenges
- Preemption Disputes
- Civil Litigation
- Injunctive Relief
- Administrative Appeals

### Confidence Scoring
Each suggestion receives a confidence level:
- **High**: Multiple keyword matches or direct document type correlation
- **Medium**: Single strong keyword match
- **Low**: Weak or tangential keyword match

## User Interface

### Location
Smart tag suggestions appear in two places:
1. **Add to Citation Library Dialog** - When saving a new citation
2. **Edit Citation Dialog** - When editing an existing citation

### Features
- **Visual Confidence Indicators**: High-confidence suggestions are marked with a badge
- **Contextual Reasons**: Each suggestion explains why it was recommended
- **One-Click Actions**: Apply or dismiss individual suggestions
- **Bulk Actions**: Apply all or dismiss all suggestions at once
- **Smart Filtering**: Already-applied tags are automatically excluded
- **Persistent Dismissals**: Dismissed suggestions won't reappear for the same citation

## Example Scenarios

### Scenario 1: Constitutional Citation
**Citation**: "U.S. Const. art. I, § 8, cl. 3"  
**Content**: "The Congress shall have Power...To regulate Commerce with foreign Nations, and among the several States..."

**Suggestions**:
- ✓ Commerce Clause (High confidence) - "Content mentions: commerce"
- ✓ Constitutional Law (High confidence) - "This is a constitutional provision"
- ✓ Federal (High confidence) - "Document is at the federal authority level"
- ✓ Federalism (Medium confidence) - "Topic detected: federal"

### Scenario 2: Due Process Citation
**Citation**: "U.S. Const. amend. XIV, § 1"  
**Content**: "...nor shall any State deprive any person of life, liberty, or property, without due process of law..."

**Suggestions**:
- ✓ Due Process (High confidence) - "Content mentions: due process"
- ✓ Fourteenth Amendment (High confidence) - "Content mentions: deprivation"
- ✓ Constitutional Law (High confidence) - "This is a constitutional provision"
- ✓ Federal (High confidence) - "Document is at the federal authority level"
- ✓ Civil Rights (Medium confidence) - "Topic detected: rights"

### Scenario 3: Preemption Analysis
**Citation**: State statute with notes mentioning "federal preemption"  
**Notes**: "Analyze potential conflict with federal Clean Air Act regulations"

**Suggestions**:
- ✓ Preemption (High confidence) - "Topic detected: preemption"
- ✓ State (High confidence) - "Document is at the state authority level"
- ✓ Preemption Dispute (Medium confidence) - "Case type indicator: preempt"
- ✓ Environmental (Medium confidence) - "Practice area: clean air"
- ✓ Federalism (Medium confidence) - "Topic detected: federal"

## Best Practices

### For Users
1. **Review Suggestions Thoughtfully**: While AI suggestions are helpful, always verify they match your intended use
2. **Add Custom Notes**: More detailed notes improve suggestion accuracy
3. **Use Manual Tags**: The tag manager allows browsing all available tags if suggestions aren't sufficient
4. **Combine Methods**: Use both suggestions and manual selection for comprehensive tagging

### For Curators
1. **Monitor Tag Usage**: Check which suggested tags are most frequently applied or dismissed
2. **Refine Keywords**: Update keyword dictionaries based on real-world usage patterns
3. **Create New Tags**: Add predefined tags for commonly occurring legal concepts
4. **Provide Descriptions**: Well-written tag descriptions help users understand when to apply them

## Technical Details

### Performance
- Suggestions are calculated client-side using in-memory analysis
- Results are cached during the editing session
- Analysis completes in <300ms for typical citations

### Privacy
- All analysis happens locally in the browser
- No citation content is sent to external services
- User dismissals are stored in local key-value storage

### Extensibility
The keyword dictionaries can be expanded to include:
- Additional constitutional provisions
- State-specific legal concepts
- Emerging areas of law
- User-contributed keywords (future feature)

## Future Enhancements

### Planned Features
- **LLM-Powered Analysis**: Optional deep analysis using spark.llm for complex citations
- **Learning from User Behavior**: Adapt suggestions based on user's tagging patterns
- **Cross-Citation Insights**: Suggest tags based on similar citations in the library
- **Bulk Tag Operations**: Apply smart suggestions to multiple existing citations
- **Custom Keyword Libraries**: Allow users to define their own keyword-to-tag mappings

### Advanced Use Cases
- **Research Projects**: Auto-tag citations by research project based on content similarity
- **Citation Networks**: Identify relationships between citations through shared tags
- **Export with Tags**: Include tag metadata in court-defensible citation exports
- **Tag-Based Search**: Enhanced search that weights tagged citations higher
