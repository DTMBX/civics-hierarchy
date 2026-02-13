import { Jurisdiction, Document, Section } from './types'

export const jurisdictions: Jurisdiction[] = [
  {
    id: 'us-federal',
    name: 'United States (Federal)',
    type: 'federal',
    abbreviation: 'U.S.'
  },
  {
    id: 'us-al',
    name: 'Alabama',
    type: 'state',
    abbreviation: 'AL',
    parentId: 'us-federal'
  },
  {
    id: 'us-ak',
    name: 'Alaska',
    type: 'state',
    abbreviation: 'AK',
    parentId: 'us-federal'
  },
  {
    id: 'us-az',
    name: 'Arizona',
    type: 'state',
    abbreviation: 'AZ',
    parentId: 'us-federal'
  },
  {
    id: 'us-ca',
    name: 'California',
    type: 'state',
    abbreviation: 'CA',
    parentId: 'us-federal'
  },
  {
    id: 'us-co',
    name: 'Colorado',
    type: 'state',
    abbreviation: 'CO',
    parentId: 'us-federal'
  },
  {
    id: 'us-ny',
    name: 'New York',
    type: 'state',
    abbreviation: 'NY',
    parentId: 'us-federal'
  },
  {
    id: 'us-tx',
    name: 'Texas',
    type: 'state',
    abbreviation: 'TX',
    parentId: 'us-federal'
  },
  {
    id: 'us-pr',
    name: 'Puerto Rico',
    type: 'territory',
    abbreviation: 'PR',
    parentId: 'us-federal'
  }
]

export const documents: Document[] = [
  {
    id: 'us-constitution',
    title: 'Constitution of the United States',
    type: 'constitution',
    authorityLevel: 'federal',
    jurisdictionId: 'us-federal',
    effectiveDate: '1789-03-04',
    verificationStatus: 'official',
    sourceUrl: 'https://www.archives.gov/founding-docs/constitution',
    description: 'The supreme law of the United States of America'
  },
  {
    id: 'ca-constitution',
    title: 'California Constitution',
    type: 'constitution',
    authorityLevel: 'state',
    jurisdictionId: 'us-ca',
    effectiveDate: '1879-07-04',
    verificationStatus: 'official',
    sourceUrl: 'https://leginfo.legislature.ca.gov/faces/codes.xhtml',
    description: 'The governing document of the State of California'
  },
  {
    id: 'ny-constitution',
    title: 'New York State Constitution',
    type: 'constitution',
    authorityLevel: 'state',
    jurisdictionId: 'us-ny',
    effectiveDate: '1895-01-01',
    verificationStatus: 'official',
    sourceUrl: 'https://www.nysenate.gov/legislation/constitution',
    description: 'The governing document of the State of New York'
  },
  {
    id: 'tx-constitution',
    title: 'Texas Constitution',
    type: 'constitution',
    authorityLevel: 'state',
    jurisdictionId: 'us-tx',
    effectiveDate: '1876-02-15',
    verificationStatus: 'official',
    sourceUrl: 'https://statutes.capitol.texas.gov/',
    description: 'The governing document of the State of Texas'
  }
]

export const sections: Section[] = [
  {
    id: 'us-const-preamble',
    documentId: 'us-constitution',
    title: 'Preamble',
    number: 'Preamble',
    text: 'We the People of the United States, in Order to form a more perfect Union, establish Justice, insure domestic Tranquility, provide for the common defence, promote the general Welfare, and secure the Blessings of Liberty to ourselves and our Posterity, do ordain and establish this Constitution for the United States of America.',
    canonicalCitation: 'U.S. Const. pmbl.',
    order: 0
  },
  {
    id: 'us-const-art1',
    documentId: 'us-constitution',
    title: 'Article I - The Legislative Branch',
    number: 'I',
    text: 'All legislative Powers herein granted shall be vested in a Congress of the United States, which shall consist of a Senate and House of Representatives.',
    canonicalCitation: 'U.S. Const. art. I',
    order: 1
  },
  {
    id: 'us-const-art1-s8',
    documentId: 'us-constitution',
    title: 'Section 8 - Powers of Congress',
    number: 'I.8',
    text: 'The Congress shall have Power To lay and collect Taxes, Duties, Imposts and Excises, to pay the Debts and provide for the common Defence and general Welfare of the United States; but all Duties, Imposts and Excises shall be uniform throughout the United States;\n\nTo borrow Money on the credit of the United States;\n\nTo regulate Commerce with foreign Nations, and among the several States, and with the Indian Tribes...',
    canonicalCitation: 'U.S. Const. art. I, § 8',
    parentSectionId: 'us-const-art1',
    order: 8
  },
  {
    id: 'us-const-art6',
    documentId: 'us-constitution',
    title: 'Article VI - The Supremacy Clause',
    number: 'VI',
    text: 'This Constitution, and the Laws of the United States which shall be made in Pursuance thereof; and all Treaties made, or which shall be made, under the Authority of the United States, shall be the supreme Law of the Land; and the Judges in every State shall be bound thereby, any Thing in the Constitution or Laws of any State to the Contrary notwithstanding.',
    canonicalCitation: 'U.S. Const. art. VI, cl. 2',
    order: 6
  },
  {
    id: 'us-const-amend1',
    documentId: 'us-constitution',
    title: 'First Amendment - Freedom of Religion, Speech, Press, Assembly, Petition',
    number: 'Amend. I',
    text: 'Congress shall make no law respecting an establishment of religion, or prohibiting the free exercise thereof; or abridging the freedom of speech, or of the press; or the right of the people peaceably to assemble, and to petition the Government for a redress of grievances.',
    canonicalCitation: 'U.S. Const. amend. I',
    order: 101
  },
  {
    id: 'us-const-amend4',
    documentId: 'us-constitution',
    title: 'Fourth Amendment - Search and Seizure',
    number: 'Amend. IV',
    text: 'The right of the people to be secure in their persons, houses, papers, and effects, against unreasonable searches and seizures, shall not be violated, and no Warrants shall issue, but upon probable cause, supported by Oath or affirmation, and particularly describing the place to be searched, and the persons or things to be seized.',
    canonicalCitation: 'U.S. Const. amend. IV',
    order: 104
  },
  {
    id: 'us-const-amend10',
    documentId: 'us-constitution',
    title: 'Tenth Amendment - Reserved Powers',
    number: 'Amend. X',
    text: 'The powers not delegated to the United States by the Constitution, nor prohibited by it to the States, are reserved to the States respectively, or to the people.',
    canonicalCitation: 'U.S. Const. amend. X',
    order: 110
  },
  {
    id: 'us-const-amend14',
    documentId: 'us-constitution',
    title: 'Fourteenth Amendment - Due Process and Equal Protection',
    number: 'Amend. XIV',
    text: 'All persons born or naturalized in the United States, and subject to the jurisdiction thereof, are citizens of the United States and of the State wherein they reside. No State shall make or enforce any law which shall abridge the privileges or immunities of citizens of the United States; nor shall any State deprive any person of life, liberty, or property, without due process of law; nor deny to any person within its jurisdiction the equal protection of the laws.',
    canonicalCitation: 'U.S. Const. amend. XIV, § 1',
    order: 114
  },
  {
    id: 'ca-const-art1-s1',
    documentId: 'ca-constitution',
    title: 'Article I, Section 1 - Inalienable Rights',
    number: 'I.1',
    text: 'All people are by nature free and independent and have inalienable rights. Among these are enjoying and defending life and liberty, acquiring, possessing, and protecting property, and pursuing and obtaining safety, happiness, and privacy.',
    canonicalCitation: 'Cal. Const. art. I, § 1',
    order: 1
  },
  {
    id: 'ca-const-art11',
    documentId: 'ca-constitution',
    title: 'Article XI - Local Government',
    number: 'XI',
    text: 'The Legislature shall provide for county powers, an elected county sheriff, an elected district attorney, an elected assessor, and an elected governing body in each county. Except as provided in this Constitution, counties and cities may adopt their own charters.',
    canonicalCitation: 'Cal. Const. art. XI',
    order: 11
  },
  {
    id: 'ny-const-art1-s8',
    documentId: 'ny-constitution',
    title: 'Article I, Section 8 - Freedom of Speech and Press',
    number: 'I.8',
    text: 'Every citizen may freely speak, write and publish sentiments on all subjects, being responsible for the abuse of that right; and no law shall be passed to restrain or abridge the liberty of speech or of the press.',
    canonicalCitation: 'N.Y. Const. art. I, § 8',
    order: 8
  }
]

export const learningTopics = [
  {
    id: 'supremacy-clause',
    title: 'The Supremacy Clause',
    category: 'Constitutional Framework',
    content: `The Supremacy Clause, found in Article VI, Clause 2 of the U.S. Constitution, establishes that federal law is "the supreme Law of the Land." This means that when state or local laws conflict with valid federal law, the federal law prevails.

**Primary Text:**
"This Constitution, and the Laws of the United States which shall be made in Pursuance thereof; and all Treaties made, or which shall be made, under the Authority of the United States, shall be the supreme Law of the Land..." (U.S. Const. art. VI, cl. 2)

**What This Means:**
The hierarchy of U.S. law follows this order (from highest to lowest authority):
1. U.S. Constitution
2. Federal statutes and treaties
3. Federal regulations
4. State constitutions
5. State statutes
6. State regulations
7. Local ordinances

**Important Limitation:**
Federal law only preempts state/local law in areas where Congress has constitutional authority to act. The Tenth Amendment reserves powers not delegated to the federal government to the states or the people.`,
    relatedSections: ['us-const-art6', 'us-const-amend10']
  },
  {
    id: 'preemption-types',
    title: 'Types of Federal Preemption',
    category: 'Constitutional Framework',
    content: `Federal preemption occurs when federal law takes precedence over state or local law. There are several types:

**1. Express Preemption**
Congress explicitly states in a statute that federal law preempts state law in a particular area.

**2. Implied Preemption - Field Preemption**
Federal regulation is so comprehensive that it occupies the entire field, leaving no room for state law (e.g., immigration law).

**3. Implied Preemption - Conflict Preemption**
State law directly conflicts with federal law, making it impossible to comply with both, or state law obstructs federal objectives.

**Example (Hypothetical for Educational Purposes):**
If a state passes a law requiring food labels that conflict with FDA labeling requirements, the state law would likely be preempted under conflict preemption doctrine.

**Note:** This is educational information, not legal advice. Actual preemption analysis requires examining specific statutes, regulations, and case law.`,
    relatedSections: ['us-const-art6']
  },
  {
    id: 'incorporation',
    title: 'Incorporation Doctrine',
    category: 'Constitutional Rights',
    content: `The Incorporation Doctrine is the legal principle by which the Bill of Rights (the first ten amendments to the U.S. Constitution) applies to state and local governments, not just the federal government.

**Constitutional Basis:**
The Fourteenth Amendment's Due Process Clause: "...nor shall any State deprive any person of life, liberty, or property, without due process of law..." (U.S. Const. amend. XIV, § 1)

**How It Works:**
Through Supreme Court decisions over many decades, most provisions of the Bill of Rights have been "incorporated" and made applicable to states. This means states cannot violate fundamental rights like freedom of speech, freedom of religion, protection against unreasonable searches, etc.

**Practical Impact:**
State constitutions and laws must respect these federal constitutional minimums, though states may provide greater protections under their own constitutions.`,
    relatedSections: ['us-const-amend14', 'us-const-amend1', 'us-const-amend4']
  }
]
