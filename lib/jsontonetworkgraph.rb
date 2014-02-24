require 'json'
load 'node.rb'
load 'link.rb'

class JSONToNetworkGraph

  def initialize(input, field1, group1, field2, group2)
    @input = JSON.parse(input)
    @field1 = field1
    @field2 = field2
    @group1 = group1
    @group2 = group2
    @nodehash = Hash.new
    @linkhash = Hash.new
    @grouphash = Hash.new
    @groupnum = 0
    @nodeindex = 0
  end

  # Generate all the nodes
  def genNodes
    @input.each do |i|
      if !(i[@field1].nil? || i[@field2].nil? || i[@field1].empty? || i[@field2].empty?)
        arrayCheckNode(@field1, i[@field1], i)
        arrayCheckNode(@field2, i[@field2], i)
      end
    end
  end

  # Handle fields that are arrays
  def arrayCheckNode(fieldname, fieldvalue, i)
    if fieldvalue.is_a? Array
      fieldvalue.each do |a|
        addupdateNode(fieldname, a, i)
      end
    else
      addupdateNode(fieldname, fieldvalue, i)
    end
  end

  # Create or update the appropriate node
  def addupdateNode(fieldname, fieldvalue, i)
    if !(@nodehash.include? fieldvalue)
      @nodehash[fieldvalue] = Node.new(@nodeindex, fieldvalue, fieldname, i)
      @nodeindex += 1
    else
      @nodehash[fieldvalue].update(i)
    end
  end

  # Generate all the links
  def genLinks
    @input.each do |i|
      if !(i[@field1].nil? || i[@field2].nil? || i[@field1].empty? || i[@field2].empty?)
        arrayCheckLink(i[@field1], i[@field2], i)
      end
    end
  end

  # Handle fields that are arrays
  def arrayCheckLink(fieldvalue1, fieldvalue2, i)
    if (fieldvalue1.is_a? Array) && !(fieldvalue2.is_a? Array)
      fieldvalue1.each do |a|
        addupdateLink(a, fieldvalue2, i)
      end
    elsif (fieldvalue2.is_a? Array) && !(fieldvalue1.is_a? Array)
      fieldvalue2.each do |a|
        addupdateLink(fieldvalue1, a, i)
      end
    elsif (fieldvalue1.is_a? Array) && (fieldvalue2.is_a? Array)
      fieldvalue1.each do |a|
        fieldvalue2.each do |b|
          addupateLink(a, b, i)
        end
      end
    else
      addupdateLink(fieldvalue1, fieldvalue2, i)
    end
  end

  # Create or update the appropriate link
  def addupdateLink(fieldvalue1, fieldvalue2, i)
    identifier = fieldvalue1 + "-" + fieldvalue2
    if !@linkhash.include? identifier
      source = @nodehash[fieldvalue1].getID
      target = @nodehash[fieldvalue2].getID

      @nodehash[fieldvalue1].addLink
      @nodehash[fieldvalue2].addLink

      @linkhash[identifier] = Link.new(source, target, fieldvalue1, fieldvalue2, i)
    else
      @linkhash[identifier].update(i)
    end
  end

  # Count the number of links
  def linkCount
    @linkhash.each_value do |l|
      count1 = @nodehash[l.instance_variable_get(:@field1)].instance_variable_get(:@linkcount)
      count2 = @nodehash[l.instance_variable_get(:@field2)].instance_variable_get(:@linkcount)

      if count1 > count2
        l.linkCount(count2)
      else
        l.linkCount(count1)
      end
    end
  end

  # Groups nodes based on another field
  def groupNodes(groupfield, nodetype)
    @input.each do |i|
      if !(i[@field1].nil? || i[@field2].nil? || i[@field1].empty? || i[@field2].empty?)
        
        # Handles fields that are arrays for groups
        if i[groupfield].is_a? Array
          i[groupfield].each do |a|
            if !@grouphash.include? a
              @groupnum += 1
              @grouphash[a] = @groupnum
            end
          end

        # Adds non-array values to grouphash
        else
          if !@grouphash.include? i[groupfield]
            @groupnum += 1
            @grouphash[i[groupfield]] = @groupnum
          end
        end
      end
    end
    
    # Assigns the correct value to each node from the grouphash
    @nodehash.each_value do |n|
      if n.getType == nodetype
        n.getValue.each do |v|
          if v[groupfield].is_a? Array
            n.setGroup(@grouphash[n.getName])
          else
            n.setGroup(@grouphash[v[groupfield]])
          end
        end
      end
    end
  end

  # Generate JSON with nodes and links
  def genJSON
    genNodes
    genLinks
    linkCount
    groupNodes(@group1, @field1)
    groupNodes(@group2, @field2)
    
    nodearray = Array.new
    @nodehash.each_value do |n|
      nodearray.push(n.nodeData)
    end

    linkarray = Array.new
    @linkhash.each_value do |l|
      linkarray.push(l.linkData)
    end

    jsonhash = {:nodes => nodearray, :links => linkarray}
    JSON.pretty_generate(jsonhash)
  end

end

n = JSONToNetworkGraph.new(File.read("data.json"), "name", "company", "extract", "extract")
puts n.genJSON
